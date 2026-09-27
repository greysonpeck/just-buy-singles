// booster-engine.js — Generic JSON-driven booster pull engine
// Replaces individual logic-*.js files one at a time.

// List of set codes that have been migrated to JSON configs.
// Add a code here after its JSON config is verified working.
window.MIGRATED_SETS = ['FDN', 'FIN', 'EOE', 'SPM', 'TLA', 'ECL', 'TMT', 'SOS', 'MSH', 'LTR', 'HOB', 'FRA'];

const _configCache = {};

// === Card Pool Cache ===
// Instead of calling /cards/random once per card (15 calls per pack), we use
// /cards/search to fetch ALL matching cards for a query in one request, cache
// the full array locally, and pick randomly from it. This reduces a 15-card pack
// from 15 sequential API calls to at most N unique queries on the first pull —
// and near-zero API calls on every subsequent pull within the same session.
//
// Two layers of caching:
//   _poolCache       — in-memory (query string → Card[]), cleared on page reload
//   localStorage     — persisted across reloads with a 24-hour TTL so prices
//                      stay fresh (Scryfall updates prices daily)
//
// _poolFetchInFlight — deduplicates concurrent fetches when two slots in the
//                      same pack share the same query string

const _poolCache = {};
const _poolFetchInFlight = {};
const _POOL_TTL = 24 * 60 * 60 * 1000; // 24 hours in ms

function _loadPoolFromStorage(query) {
    try {
        const raw = localStorage.getItem('pool_' + query);
        if (!raw) return null;
        const { cards, cachedAt } = JSON.parse(raw);
        if (Date.now() - cachedAt > _POOL_TTL) {
            localStorage.removeItem('pool_' + query); // expired — evict
            return null;
        }
        return cards;
    } catch (e) {
        return null; // parse error or storage unavailable — treat as miss
    }
}

function _savePoolToStorage(query, cards) {
    try {
        localStorage.setItem('pool_' + query, JSON.stringify({ cards, cachedAt: Date.now() }));
    } catch (e) {
        // QuotaExceededError — silently skip persistence; in-memory cache still works
    }
}

// Rate limiter — /cards/search limit is 2 req/sec (500ms gap).
// Applies to all Scryfall search requests regardless of where they originate.
let _lastRequestTime = 0;
const _MIN_REQUEST_GAP = 500;

async function _scryfallSearchFetch(url) {
    const gap = Date.now() - _lastRequestTime;
    if (gap < _MIN_REQUEST_GAP) {
        await new Promise(resolve => setTimeout(resolve, _MIN_REQUEST_GAP - gap));
    }
    _lastRequestTime = Date.now();
    const response = await fetch(url);
    if (!response.ok) throw new Error('Scryfall search failed: ' + response.status + ' for ' + url);
    return response.json();
}

// Fetches every page of results for a query and returns a flat Card array.
// Scryfall returns up to 175 cards per page; has_more + next_page handles pagination.
async function _fetchCardPool(query) {
    const cards = [];
    let url = 'https://api.scryfall.com/cards/search?q=' + query;
    while (url) {
        const page = await _scryfallSearchFetch(url);
        if (!page.data || page.data.length === 0) break;
        cards.push(...page.data);
        url = page.has_more ? page.next_page : null;
    }
    return cards;
}

// Returns the full cached card array for a query. Check order:
//   1. In-memory cache (fastest — no serialization)
//   2. localStorage cache (persisted across reloads, valid for 24h)
//   3. Scryfall /cards/search fetch (populates both caches for next time)
async function _getPool(query) {
    // 1. In-memory hit
    if (_poolCache[query]) return _poolCache[query];

    // 2. localStorage hit — also warms in-memory cache to avoid re-parsing on next call
    const stored = _loadPoolFromStorage(query);
    if (stored) {
        _poolCache[query] = stored;
        return stored;
    }

    // 3. Full miss — fetch from Scryfall. Deduplicate concurrent fetches for the
    //    same query (e.g. two slots in the same pack sharing a query string).
    if (!_poolFetchInFlight[query]) {
        _poolFetchInFlight[query] = _fetchCardPool(query).then(cards => {
            _poolCache[query] = cards;
            _savePoolToStorage(query, cards);
            delete _poolFetchInFlight[query];
            return cards;
        });
    }

    const pool = await _poolFetchInFlight[query];
    if (!pool || pool.length === 0) {
        throw new Error('Scryfall returned no cards for query: ' + query);
    }
    return pool;
}

// Main entry point for slot pull functions. Returns one card object selected at random.
async function _getCardFromPool(query) {
    const pool = await _getPool(query);
    return pool[Math.floor(Math.random() * pool.length)];
}

async function loadSetConfig(code) {
    if (_configCache[code]) return _configCache[code];
    const response = await fetch('src/sets/' + code.toLowerCase() + '.json');
    if (!response.ok) throw new Error('Failed to load set config for ' + code);
    const config = await response.json();
    _configCache[code] = config;
    return config;
}

// Accessor for other scripts (settings.js) that need the already-loaded config
// for the current set without re-fetching it.
function getLoadedSetConfig(code) {
    return _configCache[code];
}

// Replaces setXxx() functions. Called from DOMContentLoaded set-restore and set-selector buttons.
async function initSet(code, boosterType) {
    const config = await loadSetConfig(code);
    const _savedType = boosterType || localStorage.getItem('currentBoosterType');
    const actualType = (_savedType && config.boosterTypes.includes(_savedType))
        ? _savedType
        : config.boosterTypes[0];

    // Register compatibility shims so legacy callers (boosterToggle, changeSet) still work.
    window['set' + code] = () => initSet(code);
    window['set' + code + '_Money'] = () => {
        const bt = localStorage.getItem('currentBoosterType') || config.boosterTypes[0];
        const validBt = config.boosterTypes.includes(bt) ? bt : config.boosterTypes[0];
        _initSetMoney(code, validBt, config);
    };

    // State
    currentSet = code;
    localStorage.setItem('currentSet', code);
    localStorage.setItem('currentBoosterType', actualType);
    history.replaceState(null, '', '?set=' + code.toLowerCase());
    window.boosterType = config.boosterTypes.length > 1 ? 'both' : 'COLLECTOR';

    boosterCheck(config.boosterTypes.length > 1 ? 'both' : 'collector');
    priceCutActive = true;
    priceCut = 1;

    // UI
    document.getElementById('set-header').innerText = config.displayName;
    document.body.style.backgroundImage = 'url(' + config.backgroundImage + ')';
    const _playBtn = document.getElementById('play-booster');
    if (_playBtn) _playBtn.innerText = config.playLabel || 'PLAY';

    clearSlots();
    _initSetMoney(code, actualType, config);
    clearMoney();
    changeSet();

    maybeInitEarlyPricing(code, config);
}

// Replaces setXxx_Money() functions. Sets up globals and DOM slots for the given booster type.
function _initSetMoney(code, boosterType, config) {
    const boosterConfig = config.boosters[boosterType];
    if (!boosterConfig) return;

    // Set up window[code] for sumTotals()
    const collectorConfig = config.boosters.COLLECTOR;
    const playConfig = config.boosters.PLAY;
    const holidayConfig = config.boosters.HOLIDAY;
    window[code] = window[code] || {};
    window[code].totalCards = collectorConfig ? collectorConfig.totalCards : boosterConfig.totalCards;
    window[code].totalCards_PLAY = playConfig ? playConfig.totalCards : boosterConfig.totalCards;
    window[code].totalCards_HOLIDAY = holidayConfig ? holidayConfig.totalCards : boosterConfig.totalCards;
    window.setName = code;

    // Booster price cookies
    const playPart = boosterType === 'PLAY' ? '_PLAY' : boosterType === 'HOLIDAY' ? '_HOLIDAY' : '';
    const cookieKey = 'boosterValue_' + code + playPart;
    const cadCookieKey = 'boosterValue_CAD_' + code + playPart;

    boosterValue = localStorage.getItem(cookieKey) || boosterConfig.defaultUSD;
    CAD_boosterValue = localStorage.getItem(cadCookieKey) || boosterConfig.defaultCAD;
    msrp = boosterConfig.msrp;

    // Make DOM slots
    for (const slot of boosterConfig.slots) {
        makeSlot(slot.id, slot.label, slot.isFoil || false, slot.count || 0);
    }
    const cardSection = document.getElementById('card-section');
    if (config.excludedCardsDisclaimer && config.excludedCardsDisclaimer.includes(boosterType)) {
        // Give the whole card grid extra headroom so the disclaimer (absolutely positioned
        // above the first slot, below) has clear space to sit in above the cards without
        // overlapping whatever's above #card-section (e.g. the Investigate button).
        cardSection.style.marginTop = '2rem';

        const firstCardInfo = cardSection.querySelector('.card-info');
        if (firstCardInfo) {
            const totalCard = firstCardInfo.parentElement;
            totalCard.style.position = 'relative';
            const disclaimer = document.createElement('p');
            disclaimer.id = 'serialized-disclaimer';
            disclaimer.className = 'pt-2 sm:pt-0';
            disclaimer.style.cssText = 'position:absolute;bottom:100%;left:0.75rem;font-size:0.75rem;line-height:1rem;opacity:0.75;padding-bottom:0.5rem;text-align:left;white-space:nowrap;';
            disclaimer.textContent = 'Serialized cards not included in this simulation.';
            totalCard.appendChild(disclaimer);
        }
    } else {
        cardSection.style.marginTop = '';
    }

    localStorage.setItem(cookieKey, boosterValue);
    localStorage.setItem(cadCookieKey, CAD_boosterValue);
}

// Replaces pullXxx() functions. Called from the hybrid pullBooster() in scripts.js.
async function pullBoosterFromConfig(config, boosterType) {
    const boosterConfig = config.boosters[boosterType];
    if (!boosterConfig) return;

    cardsRemaining = boosterConfig.totalCards;
    const _cardsLoadingEl = document.getElementById("cards-loading");
    if (_cardsLoadingEl) _cardsLoadingEl.innerText = cardsRemaining;

    // Flip all card stacks to the back. Single-card slots flip simultaneously;
    // individual cards within multi-card stacks (commons, uncommons) stagger by
    // 25ms each so they fan out visually rather than all flipping at once.
    let staggerMs = 0;
    for (const slot of boosterConfig.slots) {
        if (slot.count && slot.count > 1) {
            for (let k = 1; k <= slot.count; k++) {
                const img = document.getElementById(slot.id + '-image-' + k);
                const stack = img?.parentElement; // parentElement is the .both-cards div
                if (stack) {
                    stack.style.transitionDelay = staggerMs + 'ms';
                    stack.classList.add('flipped');
                    staggerMs += 25;
                }
            }
        } else {
            const img = document.getElementById(slot.id + '-image');
            const stack = img?.closest('.both-cards');
            if (stack) stack.classList.add('flipped');
        }
    }

    // The reveal chain waits for the flip-to-back animation to fully complete
    // before any card reveals. The last staggered card finishes at 1100 + staggerMs.
    let prevReveal = waitforme(1100 + staggerMs);

    const foilGroupMap = {}; // tracks foil groups (e.g., FIN bfr slots)

    // Wrap in try/catch so sumTotals() always runs even if a pool fetch fails
    // (e.g. a misconfigured query returns 0 results from Scryfall).
    try {
        for (const slot of boosterConfig.slots) {
            let result;
            if (slot.echoedPairs) {
                result = await _pullEchoedPairSlot(slot, prevReveal);
            } else if (slot.count && slot.count > 1) {
                result = await _pullMultiSlot(slot, prevReveal);
            } else {
                result = await _pullSingleSlot(slot, foilGroupMap, prevReveal);
            }
            // result.revealPromise resolves when this slot's last card is revealed.
            // Passing it as prevReveal to the next slot enforces DOM-order reveals.
            prevReveal = result.revealPromise;
        }
    } catch (err) {
        console.error('[booster-engine] Pack pull aborted:', err);
    }

    sumTotals();
}

const _ALL_GRADIENT_CLASSES = ['foil-gradient', 'mana-gradient', 'surge-gradient', 'galaxy-gradient'];

// A card's price is "missing" when Scryfall has no data for that treatment at
// all (prices[key] is null) — not to be confused with a genuine $0 value,
// which doesn't happen for real cards. Rendered as a small maroon chip instead
// of a dollar amount; single-card slots read "No price yet", multi-card slots
// read "Missing data" (see _pullMultiSlot/_pullEchoedPairSlot).
function _priceIssueBadgeHTML(label) {
    return '<span class="inline-flex items-center justify-center whitespace-nowrap px-[5px] py-[3px] rounded-[2px] text-xs font-semibold text-white bg-[#AA0033]/40">' + label + '</span>';
}

function _tickCardLoaded() {
    cardsRemaining--;
    const el = document.getElementById("cards-loading");
    if (el) el.innerText = cardsRemaining;
}

// Pulls a single-card slot. Handles foil groups, nested probabilities, and foil flips.
// prevReveal: Promise that resolves when the previous card has been revealed.
//             cardImageLoaded waits for this before flipping to front, ensuring DOM order.
// Returns { revealPromise } — resolves when THIS card is revealed. Wrapped in an object
// so the caller's `await _pullSingleSlot()` doesn't chain into the reveal promise.
async function _pullSingleSlot(slot, foilGroupMap, prevReveal) {
    // Filter probabilities when a foil group has already been used this pack
    let probs = slot.probabilities;
    if (slot.foilGroup && foilGroupMap[slot.foilGroup]) {
        probs = probs.filter(p => !p.foilClass);
    }

    // Roll ceiling is the table's own last maxRoll, not a hardcoded 100 — some slots
    // intentionally omit serialized-card probability mass (not simulated), so their
    // real cumulative total falls short of 100. Capping the roll there (instead of
    // force-closing the last entry at 100) keeps every entry's relative odds intact.
    const roll = slot.rollOverride !== undefined ? slot.rollOverride : getRandomNumber(0, probs[probs.length - 1].maxRoll);

    // Find the matching probability entry
    let entry = probs[probs.length - 1];
    for (const prob of probs) {
        if (roll <= prob.maxRoll) {
            entry = prob;
            break;
        }
    }

    // Handle nested probabilities (e.g., MH3 borderless wildcard)
    if (entry.nestedProbabilities) {
        const nested = entry.nestedProbabilities;
        const nestedMax = nested[nested.length - 1].maxRoll;
        const nestedRoll = getRandomNumber(0, nestedMax);
        let nestedEntry = nested[nested.length - 1];
        for (const n of nested) {
            if (nestedRoll <= n.maxRoll) {
                nestedEntry = n;
                break;
            }
        }
        // Merge nested entry fields over parent (but keep parent's foilClass if nested doesn't specify)
        entry = Object.assign({}, entry, nestedEntry, { nestedProbabilities: undefined });
    }

    // Handle 50% foil flip (e.g., FIN fca slot)
    let resolvedFoilClass = entry.foilClass; // undefined = no foilClass key in entry
    if (slot.foilFlip) {
        const flip = getRandomInt(1, 2);
        resolvedFoilClass = (flip === 1) ? (entry.foilFlipClass || 'foil-gradient') : null;
    }

    // Pick one card at random from the cached pool for this query.
    // On first call the pool is fetched from Scryfall; subsequent calls are instant.
    const card = await _getCardFromPool(entry.query);
    _tickCardLoaded();

    // Determine price key
    let priceKey = entry.priceKey;
    if (!priceKey) {
        if (slot.foilFlip) {
            priceKey = resolvedFoilClass ? 'usd_foil' : 'usd';
        } else if (entry.foilClass !== undefined) {
            // Entry explicitly declares foilClass (could be string or null)
            priceKey = entry.foilClass ? 'usd_foil' : 'usd';
        } else {
            priceKey = slot.isFoil ? 'usd_foil' : 'usd';
        }
    }

    const price = convertCurrency(Number((card.prices[priceKey] || 0) * priceCut));

    // Get image URL (handle DFCs)
    let imageUrl;
    if (card.layout === 'transform' || card.layout === 'modal_dfc' || card.layout === 'reversible_card') {
        imageUrl = card.card_faces[0].image_uris.normal;
    } else {
        imageUrl = card.image_uris.normal;
    }

    // Set card info for infopop
    window.cardInfo = window.cardInfo || {};
    const _entryType = (slot.foilFlip && resolvedFoilClass) ? entry.type + ' (Foil)' : entry.type;
    window.cardInfo[slot.id] = [card.name, _entryType, entry.rarity || ''];
    window.cardInfoComments = window.cardInfoComments || {};
    window.cardInfoComments[slot.id] = slot._comment || null;

    // Get image element
    const imageElement = document.getElementById(slot.id + '-image');

    // Stash name/price for the lightbox header (see scripts.js card-lightbox handler).
    imageElement.dataset.cardName = card.name;
    imageElement.dataset.cardPrice = (card.prices[priceKey] == null) ? 'No price yet' : USDollar.format(price);

    // Build foil overlay callback — runs after card flips to back, before reveal.
    // Always runs for foil slots (not just when this entry sets foilClass) — otherwise
    // an entry with no foilClass silently leaves whatever gradient the previous pull
    // left on this same DOM node, instead of resetting to the default foil-gradient.
    let foilCallback = null;
    if (slot.isFoil) {
        const overlay = imageElement.previousElementSibling;
        const foilClassToApply = slot.foilFlip ? resolvedFoilClass : (entry.foilClass !== undefined ? entry.foilClass : 'foil-gradient');
        foilCallback = () => {
            _ALL_GRADIENT_CLASSES.forEach(cls => overlay.classList.remove(cls));
            if (foilClassToApply) {
                const classes = Array.isArray(foilClassToApply) ? foilClassToApply : [foilClassToApply];
                classes.forEach(cls => overlay.classList.add(cls));
            }
        };
    }

    const stack = imageElement.closest('.both-cards');

    // Kick off the reveal — loads image in background, waits for prevReveal, then
    // flips to front. NOT awaited here so the slot loop can move on immediately.
    const revealPromise = cardImageLoaded(imageElement, imageUrl, stack, true, foilCallback, prevReveal);

    // Update price/roll elements
    const priceElement = document.getElementById(slot.id + '-price');
    if (priceElement) {
        if (card.prices[priceKey] == null) {
            priceElement.innerHTML = _priceIssueBadgeHTML('No price yet');
        } else {
            priceElement.innerText = USDollar.format(price);
        }
    }
    const rollElement = document.getElementById(slot.id + '-roll');
    if (rollElement) rollElement.innerText = 'Roll: ' + roll.toFixed(0);

    if (slot.debugLog) console.log('[' + slot.id + '] ' + card.name + ' — ' + USDollar.format(price));

    myPrices.push(price);

    // Mark foil group as used
    if (slot.foilGroup) {
        const usedFoil = slot.foilFlip ? !!resolvedFoilClass : !!entry.foilClass;
        if (usedFoil) foilGroupMap[slot.foilGroup] = true;
    }

    return { revealPromise };
}

// ms between each card's reveal within a multi-card stack (commons, uncommons).
// All cards fan out from the same prevReveal start point with absolute offsets,
// so timing is predictable regardless of image load order.
const _MULTI_REVEAL_STAGGER_MS = 150;

// Renders card k of a multi-card slot: resolves price/image, sets up the foil
// overlay callback, and kicks off the staggered reveal. Shared by _pullMultiSlot
// and _pullEchoedPairSlot so both stay in sync on rendering behavior.
// cardRevealGate: the Promise this specific card's reveal waits on.
// Returns { price, revealPromise, missing } — missing is true when Scryfall has
// no price data at all for this treatment (as opposed to a genuine $0 value).
function _renderMultiCard(slot, k, card, entry, cardRevealGate) {
    const priceKey = entry.priceKey || (slot.isFoil ? 'usd_foil' : 'usd');
    const missing = card.prices[priceKey] == null;
    const price = convertCurrency(Number((card.prices[priceKey] || 0) * priceCut));

    let imageUrl;
    if (card.layout === 'transform' || card.layout === 'modal_dfc' || card.layout === 'reversible_card') {
        imageUrl = card.card_faces[0].image_uris.normal;
    } else {
        imageUrl = card.image_uris.normal;
    }

    const imageElement = document.getElementById(slot.id + '-image-' + k);

    // Stash name/price for the lightbox header (see scripts.js card-lightbox handler).
    imageElement.dataset.cardName = card.name;
    imageElement.dataset.cardPrice = missing ? 'No price yet' : USDollar.format(price);

    // Multi-slot uses parentElement (not .both-cards) for the flip stack
    const stack = imageElement.parentElement;

    // Build foil overlay callback — mirrors _pullSingleSlot, including always running
    // for foil slots (not just when this entry sets foilClass) so a plain entry resets
    // the overlay instead of leaving a previous pull's gradient class stuck on it. In
    // makeSlot's multi-card DOM, the foil-hold div is inserted right after the front
    // image (opposite order from the single-card block), so nextElementSibling finds it.
    let foilCallback = null;
    if (slot.isFoil) {
        const overlay = imageElement.nextElementSibling;
        const foilClassToApply = entry.foilClass !== undefined ? entry.foilClass : 'foil-gradient';
        foilCallback = () => {
            _ALL_GRADIENT_CLASSES.forEach(cls => overlay.classList.remove(cls));
            if (foilClassToApply) {
                const classes = Array.isArray(foilClassToApply) ? foilClassToApply : [foilClassToApply];
                classes.forEach(cls => overlay.classList.add(cls));
            }
        };
    }

    const revealPromise = cardImageLoaded(imageElement, imageUrl, stack, true, foilCallback, cardRevealGate);

    if (slot.debugLog) console.log('[' + slot.id + ':' + k + '] ' + card.name + ' — ' + USDollar.format(price));

    return { price, revealPromise, missing };
}

// Pulls a multi-card slot (e.g., commons, uncommons).
// prevReveal: Promise from the previous slot (see _pullSingleSlot comment).
// Returns { revealPromise } for the LAST card in this slot, so the next slot
// waits for all cards in this slot to reveal before it can reveal.
async function _pullMultiSlot(slot, prevReveal) {
    let sumPrice = 0;
    let anyMissing = false; // true if any card in the stack has no price data at all
    let lastCardReveal; // tracks the last card's reveal promise for the return value

    for (let k = 1; k <= slot.count; k++) {
        const isLastCard = k === slot.count;

        // Trailing override: an unconditional pack-level chance (independent of the
        // normal roll below) that only ever applies to the last card in the stack —
        // so it's visible at a glance rather than buried mid-stack. When it fires it
        // replaces the last card's pull outright; it does not require — and is not
        // reduced by — whatever the normal roll would otherwise have produced.
        const override = isLastCard ? slot.trailingOverride : null;
        let entry, card;
        if (override && Math.random() * 100 < override.chance) {
            entry = { type: override.type, foilClass: override.foilClass, query: override.query };
            card = await _getCardFromPool(override.query);
        } else {
            const probs = (isLastCard && slot.trailingCard) ? slot.trailingCard.probabilities : slot.probabilities;

            // See _pullSingleSlot for why the roll ceiling is the table's own last maxRoll.
            const roll = slot.rollOverride !== undefined ? slot.rollOverride : getRandomNumber(0, probs[probs.length - 1].maxRoll);

            entry = probs[probs.length - 1];
            for (const prob of probs) {
                if (roll <= prob.maxRoll) {
                    entry = prob;
                    break;
                }
            }

            // Pick one card at random from the cached pool for this query.
            card = await _getCardFromPool(entry.query);
        }
        _tickCardLoaded();

        // Fan each card out from the same prevReveal start using an absolute offset.
        // Card 1 reveals immediately when prevReveal resolves; card 2 reveals 150ms later;
        // card 3 reveals 300ms later; etc. This is more reliable than a cascading chain
        // because timing doesn't depend on when each card's image happens to finish loading.
        const cardRevealGate = k === 1
            ? prevReveal
            : prevReveal.then(() => waitforme((k - 1) * _MULTI_REVEAL_STAGGER_MS));

        const { price, revealPromise, missing } = _renderMultiCard(slot, k, card, entry, cardRevealGate);
        lastCardReveal = revealPromise;
        sumPrice += price;
        anyMissing = anyMissing || missing;
        myPrices.push(price);
    }

    if (slot.sumVar) {
        window[slot.sumVar] = (window[slot.sumVar] || 0) + sumPrice;
    } else {
        const sumElement = document.getElementById(slot.id + '-sum');
        if (sumElement) {
            if (anyMissing) {
                sumElement.innerHTML = _priceIssueBadgeHTML('Missing data');
            } else {
                sumElement.innerText = '$' + sumPrice.toFixed(2);
            }
        }
    }

    // Set static card info for infopop
    window.cardInfo = window.cardInfo || {};
    if (slot.cardInfo) {
        window.cardInfo[slot.id] = slot.cardInfo;
    }
    window.cardInfoComments = window.cardInfoComments || {};
    window.cardInfoComments[slot.id] = slot._comment || null;

    // Return the last card's reveal promise. Since it has the longest delay, waiting
    // for it guarantees all earlier cards have also revealed.
    return { revealPromise: lastCardReveal };
}

// Rolls one entry out of a probability table using the table's own last maxRoll
// as the ceiling (see _pullSingleSlot for why — some tables intentionally omit
// probability mass for cards that aren't simulated).
function _rollProbabilityTable(probs) {
    const roll = getRandomNumber(0, probs[probs.length - 1].maxRoll);
    let entry = probs[probs.length - 1];
    for (const prob of probs) {
        if (roll <= prob.maxRoll) {
            entry = prob;
            break;
        }
    }
    return { entry, roll };
}

// Pulls an "echoed pair" slot (FRA): 2 of the 3 cards are a matched pair (a card
// and its named partner, e.g. CN 198 + CN 230), and the third is an independent pull.
//
// slot.pairProbabilities — rolled once to pick the pair's rarity/treatment. Scoped to
//   queries that only ever return cards covered by slot.pairMap (so a partner CN is
//   always resolvable) — i.e. no borderless entries here, since we don't have a
//   borderless-to-base CN mapping to find THEIR partners.
// slot.pairMap — { "195": "242", "242": "195", ... } bidirectional CN -> partner CN.
// slot.pairPartnerQuery — template string with a "{CN}" placeholder used to fetch the
//   partner by exact collector number, e.g. "set%3Afra+cn%3D{CN}&unique=cards".
// slot.probabilities — the full table (including any borderless entries) used for the
//   third, independent card.
async function _pullEchoedPairSlot(slot, prevReveal) {
    const { entry: pairEntry, roll: pairRoll } = _rollProbabilityTable(slot.pairProbabilities);
    const pairPool = await _getPool(pairEntry.query);
    const eligible = pairPool.filter(c => slot.pairMap[String(parseInt(c.collector_number, 10))]);
    if (eligible.length === 0) {
        throw new Error('[' + slot.id + '] No pairable cards found for query: ' + pairEntry.query);
    }
    const cardA = eligible[Math.floor(Math.random() * eligible.length)];
    const partnerCN = slot.pairMap[String(parseInt(cardA.collector_number, 10))];
    const cardB = await _getCardFromPool(slot.pairPartnerQuery.replace('{CN}', partnerCN));

    const { entry: soloEntry, roll: soloRoll } = _rollProbabilityTable(slot.probabilities);
    const cardC = await _getCardFromPool(soloEntry.query);

    _tickCardLoaded();
    _tickCardLoaded();
    _tickCardLoaded();

    const picks = [
        { card: cardC, entry: soloEntry },
        { card: cardA, entry: pairEntry },
        { card: cardB, entry: pairEntry },
    ];

    let sumPrice = 0;
    let anyMissing = false;
    let lastCardReveal;
    for (let k = 1; k <= 3; k++) {
        const { card, entry } = picks[k - 1];
        const cardRevealGate = k === 1
            ? prevReveal
            : prevReveal.then(() => waitforme((k - 1) * _MULTI_REVEAL_STAGGER_MS));

        const { price, revealPromise, missing } = _renderMultiCard(slot, k, card, entry, cardRevealGate);
        lastCardReveal = revealPromise;
        sumPrice += price;
        anyMissing = anyMissing || missing;
        myPrices.push(price);
    }

    if (slot.sumVar) {
        window[slot.sumVar] = (window[slot.sumVar] || 0) + sumPrice;
    } else {
        const sumElement = document.getElementById(slot.id + '-sum');
        if (sumElement) {
            if (anyMissing) {
                sumElement.innerHTML = _priceIssueBadgeHTML('Missing data');
            } else {
                sumElement.innerText = '$' + sumPrice.toFixed(2);
            }
        }
    }

    window.cardInfo = window.cardInfo || {};
    if (slot.cardInfo) {
        window.cardInfo[slot.id] = slot.cardInfo;
    }
    window.cardInfoComments = window.cardInfoComments || {};
    window.cardInfoComments[slot.id] = slot._comment || null;

    if (slot.debugLog) console.log('[' + slot.id + '] pair roll ' + pairRoll.toFixed(0) + ' -> ' + cardA.name + ' + ' + cardB.name + '; solo roll ' + soloRoll.toFixed(0) + ' -> ' + cardC.name);

    return { revealPromise: lastCardReveal };
}
