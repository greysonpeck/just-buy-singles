// booster-engine.js — Generic JSON-driven booster pull engine
// Replaces individual logic-*.js files one at a time.

// List of set codes that have been migrated to JSON configs.
// Add a code here after its JSON config is verified working.
window.MIGRATED_SETS = ['FDN', 'DSK', 'FIN', 'EOE'];

const _configCache = {};

async function loadSetConfig(code) {
    if (_configCache[code]) return _configCache[code];
    const response = await fetch('src/sets/' + code.toLowerCase() + '.json');
    if (!response.ok) throw new Error('Failed to load set config for ' + code);
    const config = await response.json();
    _configCache[code] = config;
    return config;
}

// Replaces setXxx() functions. Called from DOMContentLoaded set-restore and set-selector buttons.
async function initSet(code, boosterType) {
    const config = await loadSetConfig(code);
    const actualType = boosterType || getCookie('currentBoosterType') || config.boosterTypes[0];

    // Register compatibility shims so legacy callers (boosterToggle, changeSet) still work.
    window['set' + code] = () => initSet(code);
    window['set' + code + '_Money'] = () => {
        const bt = getCookie('currentBoosterType') || config.boosterTypes[0];
        _initSetMoney(code, bt, config);
    };

    // State
    currentSet = code;
    document.cookie = 'currentSet = ' + code;
    document.cookie = 'currentBoosterType = ' + actualType;
    window.boosterType = config.boosterTypes.length > 1 ? 'both' : 'COLLECTOR';

    boosterCheck(config.boosterTypes.length > 1 ? 'both' : 'collector');
    priceCutActive = true;
    priceCut = 1;

    // UI
    document.getElementById('set-header').innerText = config.displayName;
    document.body.style.backgroundImage = 'url(' + config.backgroundImage + ')';

    clearSlots();
    _initSetMoney(code, actualType, config);
    clearMoney();
    changeSet();
}

// Replaces setXxx_Money() functions. Sets up globals and DOM slots for the given booster type.
function _initSetMoney(code, boosterType, config) {
    const boosterConfig = config.boosters[boosterType];
    if (!boosterConfig) return;

    // Set up window[code] for sumTotals()
    const collectorConfig = config.boosters.COLLECTOR;
    const playConfig = config.boosters.PLAY;
    window[code] = window[code] || {};
    window[code].totalCards = collectorConfig ? collectorConfig.totalCards : boosterConfig.totalCards;
    window[code].totalCards_PLAY = playConfig ? playConfig.totalCards : boosterConfig.totalCards;
    window.setName = window[code];

    // Booster price cookies
    const playPart = boosterType === 'PLAY' ? '_PLAY' : '';
    const cookieKey = 'boosterValue_' + code + playPart;
    const cadCookieKey = 'boosterValue_CAD_' + code + playPart;

    boosterValue = getCookie(cookieKey) ? getCookie(cookieKey) : boosterConfig.defaultUSD;
    CAD_boosterValue = getCookie(cadCookieKey) ? getCookie(cadCookieKey) : boosterConfig.defaultCAD;
    msrp = boosterConfig.msrp;

    // Make DOM slots
    for (const slot of boosterConfig.slots) {
        makeSlot(slot.id, slot.label, slot.isFoil || false, slot.count || 0);
    }

    document.cookie = cookieKey + ' = ' + boosterValue;
    document.cookie = cadCookieKey + ' = ' + CAD_boosterValue;
}

// Replaces pullXxx() functions. Called from the hybrid pullBooster() in scripts.js.
async function pullBoosterFromConfig(config, boosterType) {
    const boosterConfig = config.boosters[boosterType];
    if (!boosterConfig) return;

    const foilGroupMap = {}; // tracks foil groups (e.g., FIN bfr slots)

    for (const slot of boosterConfig.slots) {
        if (slot.count && slot.count > 1) {
            await _pullMultiSlot(slot);
        } else {
            await _pullSingleSlot(slot, foilGroupMap);
        }
    }

    sumTotals();
}

const _ALL_GRADIENT_CLASSES = ['foil-gradient', 'mana-gradient', 'surge-gradient', 'galaxy-gradient'];

// Pulls a single-card slot. Handles foil groups, nested probabilities, and foil flips.
async function _pullSingleSlot(slot, foilGroupMap) {
    const roll = slot.rollOverride !== undefined ? slot.rollOverride : getRandomNumber(0, 100);

    // Filter probabilities when a foil group has already been used this pack
    let probs = slot.probabilities;
    if (slot.foilGroup && foilGroupMap[slot.foilGroup]) {
        probs = probs.filter(p => !p.foilClass);
    }

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

    // Fetch card from Scryfall
    const response = await fetch('https://api.scryfall.com/cards/random?q=' + entry.query);
    const card = await response.json();

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

    // Get image element
    const imageElement = document.getElementById(slot.id + '-image');

    // Manage foil overlay class (only for isFoil: true slots)
    if (slot.isFoil) {
        const overlay = imageElement.previousElementSibling;
        const foilClassToApply = slot.foilFlip ? resolvedFoilClass : entry.foilClass;
        // Only manage when entry explicitly declares a foilClass (or slot has foilFlip)
        if (slot.foilFlip || entry.foilClass !== undefined) {
            _ALL_GRADIENT_CLASSES.forEach(cls => overlay.classList.remove(cls));
            if (foilClassToApply) {
                const classes = Array.isArray(foilClassToApply) ? foilClassToApply : [foilClassToApply];
                classes.forEach(cls => overlay.classList.add(cls));
            }
        }
    }

    // Set image and trigger flip animation
    imageElement.src = imageUrl;
    const stack = imageElement.closest('.both-cards');
    imageElement.addEventListener('load', cardImageLoaded(imageElement, imageUrl, stack));

    // Update price/roll elements
    const priceElement = document.getElementById(slot.id + '-price');
    if (priceElement) priceElement.innerText = USDollar.format(price);
    const rollElement = document.getElementById(slot.id + '-roll');
    if (rollElement) rollElement.innerText = 'Roll: ' + roll.toFixed(0);

    if (slot.debugLog) console.log('[' + slot.id + '] ' + card.name + ' — ' + USDollar.format(price));

    myPrices.push(price);

    // Mark foil group as used
    if (slot.foilGroup) {
        const usedFoil = slot.foilFlip ? !!resolvedFoilClass : !!entry.foilClass;
        if (usedFoil) foilGroupMap[slot.foilGroup] = true;
    }
}

// Pulls a multi-card slot (e.g., commons, uncommons).
async function _pullMultiSlot(slot) {
    let sumPrice = 0;

    for (let k = 1; k <= slot.count; k++) {
        const roll = slot.rollOverride !== undefined ? slot.rollOverride : getRandomNumber(0, 100);

        let entry = slot.probabilities[slot.probabilities.length - 1];
        for (const prob of slot.probabilities) {
            if (roll <= prob.maxRoll) {
                entry = prob;
                break;
            }
        }

        const response = await fetch('https://api.scryfall.com/cards/random?q=' + entry.query);
        const card = await response.json();

        const priceKey = entry.priceKey || (slot.isFoil ? 'usd_foil' : 'usd');
        const price = convertCurrency(Number((card.prices[priceKey] || 0) * priceCut));

        let imageUrl;
        if (card.layout === 'transform' || card.layout === 'modal_dfc' || card.layout === 'reversible_card') {
            imageUrl = card.card_faces[0].image_uris.normal;
        } else {
            imageUrl = card.image_uris.normal;
        }

        const imageElement = document.getElementById(slot.id + '-image-' + k);
        imageElement.src = imageUrl;

        // Multi-slot uses parentElement (not .both-cards) for the flip stack
        const stack = imageElement.parentElement;
        imageElement.addEventListener('load', cardImageLoaded(imageElement, imageUrl, stack));

        if (slot.debugLog) console.log('[' + slot.id + ':' + k + '] ' + card.name + ' — ' + USDollar.format(price));
        sumPrice += price;
        myPrices.push(price);
    }

    if (slot.sumVar) {
        window[slot.sumVar] = (window[slot.sumVar] || 0) + sumPrice;
    } else {
        const sumElement = document.getElementById(slot.id + '-sum');
        if (sumElement) sumElement.innerText = '$' + sumPrice.toFixed(2);
    }

    // Set static card info for infopop
    window.cardInfo = window.cardInfo || {};
    if (slot.cardInfo) {
        window.cardInfo[slot.id] = slot.cardInfo;
    }
}
