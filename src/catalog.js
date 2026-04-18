/**
 * catalog.js — shared logic for all catalog pages.
 *
 * Usage: call initCatalog(config) with:
 *   config.modes = [{ id, label, query, alwaysShowNormal?, foilOnly? }, ...]
 *   First mode is the "base" (English); subsequent modes are alt views
 *   matched to base cards by name.
 *
 *   alwaysShowNormal — always render a Normal price row, "no data" if missing
 *   foilOnly         — bucket and display by usd_foil/usd_etched instead of usd
 *
 * HTML page needs:
 *   <div id="mode-toggle" class="ma-toggle mt-4 ring-1 ring-gray-400"></div>
 *   <div id="loading">Loading cards…</div>
 *   <div id="buckets"></div>
 *   <span id="fetch-date"></span>      (optional — filled with ", as of Month D")
 *   <span id="catalog-currency"></span> (optional — filled with USD/CAD toggle)
 *
 * Requires money.js (fx) for CAD conversion.
 */

const BG_STYLES = [
    'background: linear-gradient(to bottom, rgba(175,130,20,0.65), rgba(175,130,20,0.15))', // gold       — Over $1,000
    'background: linear-gradient(to bottom, rgba(170,80,30,0.65),  rgba(170,80,30,0.15))',  // orange     — Over $500
    'background: linear-gradient(to bottom, rgba(165,55,35,0.65),  rgba(165,55,35,0.15))',  // orange-red — Over $250
    'background: linear-gradient(to bottom, rgba(160,50,50,0.65),  rgba(160,50,50,0.15))',  // red        — Over $100
    'background: linear-gradient(to bottom, rgba(145,50,90,0.65),  rgba(145,50,90,0.15))',  // crimson    — Over $50
    'background: linear-gradient(to bottom, rgba(120,50,120,0.65), rgba(120,50,120,0.15))', // magenta    — Over $20
    'background: linear-gradient(to bottom, rgba(80,50,150,0.65),  rgba(80,50,150,0.15))',  // purple     — Over $10
    'background: linear-gradient(to bottom, rgba(55,70,165,0.65),  rgba(55,70,165,0.15))',  // blue       — Over $5
    'background: linear-gradient(to bottom, rgba(35,95,155,0.65),  rgba(35,95,155,0.15))',  // sky blue   — $1–$5
    'background: linear-gradient(to bottom, rgba(30,110,95,0.65),  rgba(30,110,95,0.15))',  // teal       — Under $1
    'background: linear-gradient(to bottom, rgba(30,30,35,0.70),   rgba(30,30,35,0.30))',   // dark gray  — No prices yet
];

function _makeBuckets() {
    const s = '$';
    return [
        { label: `Over ${s}1,000 (yo??)`,  min: 1000, max: Infinity },
        { label: `Over ${s}500`,            min: 500,  max: 1000     },
        { label: `Over ${s}250`,            min: 250,  max: 500      },
        { label: `Over ${s}100`,            min: 100,  max: 250      },
        { label: `Over ${s}50`,             min: 50,   max: 100      },
        { label: `Over ${s}20`,             min: 20,  max: 50       },
        { label: `Over ${s}10`,             min: 10,  max: 20       },
        { label: `Over ${s}5`,              min: 5,   max: 10       },
        { label: `${s}1\u2013${s}5`,        min: 1,   max: 5        },
        { label: `Under ${s}1`,             min: 0,   max: 1        },
        { label: 'No prices yet',           noPrice: true           },
    ].map((b, i) => ({ ...b, bgStyle: BG_STYLES[i] }));
}

const CARD_BACK = './img/card_default4.png';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ── Currency ───────────────────────────────────────────────────────
let currencyMode = 'USD';

// ── Cache helpers ──────────────────────────────────────────────────
function _getCached(query) {
    try {
        const raw = localStorage.getItem('catalog_' + query);
        if (!raw) return null;
        const entry = JSON.parse(raw);
        if (Date.now() - entry.at > CACHE_TTL) return null;
        return entry; // { cards, at }
    } catch { return null; }
}

function _setCache(query, cards) {
    try {
        localStorage.setItem('catalog_' + query, JSON.stringify({ cards, at: Date.now() }));
    } catch {}
}

function _fmtDate(ts) {
    return new Date(ts).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function initCatalog(config) {
    const modes = config.modes;

    let baseCards  = [];
    const altMaps  = {}; // mode.id → { name → card }
    let currentMode = modes[0].id;
    let isAnimating = false;

    // Read currency preference on init
    currencyMode = localStorage.getItem('currencyMode') || 'USD';

    // ── Build toggle UI ────────────────────────────────────────────
    const toggleEl = document.getElementById('mode-toggle');
    modes.forEach((mode, i) => {
        if (i > 0) {
            const div = document.createElement('div');
            div.className = 'ma-divider';
            toggleEl.appendChild(div);
        }
        const btn = document.createElement('button');
        btn.id        = 'btn-' + mode.id;
        btn.className = i === 0 ? 'ma-btn-active' : 'ma-btn-inactive';
        btn.textContent = mode.label;
        btn.onclick   = () => setMode(mode.id);
        toggleEl.appendChild(btn);
    });

    // ── Currency toggle ────────────────────────────────────────────
    function renderCurrencyToggle() {
        const el = document.getElementById('catalog-currency');
        if (!el) return;
        el.innerHTML =
            `<label class="switch ml-3 align-middle cursor-pointer">` +
            `<input type="checkbox" id="cat-currency-input" class="opacity-0 w-0 h-0 absolute"` +
            (currencyMode === 'CAD' ? ' checked' : '') + `>` +
            `<span id="cat-toggle" class="toggle${currencyMode === 'CAD' ? ' toggle-cad on' : ''}"></span>` +
            `</label>`;
        el.querySelector('#cat-currency-input').addEventListener('change', e => {
            currencyMode = e.target.checked ? 'CAD' : 'USD';
            localStorage.setItem('currencyMode', currencyMode);
            const toggle = el.querySelector('#cat-toggle');
            toggle.classList.toggle('toggle-cad', currencyMode === 'CAD');
            toggle.classList.toggle('on', currencyMode === 'CAD');
            rebuildCurrentMode();
        });
    }

    function rebuildCurrentMode() {
        const isBase = currentMode === modes[0].id;
        const cards  = isBase
            ? baseCards
            : baseCards.map(c => altMaps[currentMode]?.[c.name] ?? c);
        buildBuckets(currentMode, cards, false);
    }

    // ── Fetch (with 24h cache) ─────────────────────────────────────
    async function init() {
        try {
            const results = await Promise.all(modes.map(async m => {
                const cached = _getCached(m.query);
                if (cached) return cached;
                const resp = await fetch('https://api.scryfall.com/cards/search?q=' + m.query + '&order=usd&dir=desc');
                if (!resp.ok) throw new Error('Scryfall error ' + resp.status);
                const data = await resp.json();
                const cards = data.data ?? [];
                _setCache(m.query, cards);
                return { cards, at: Date.now() };
            }));

            baseCards = results[0].cards;
            for (let i = 1; i < modes.length; i++) {
                const map = {};
                for (const card of results[i].cards) map[card.name] = card;
                altMaps[modes[i].id] = map;
            }

            document.getElementById('loading').remove();

            const dateEl = document.getElementById('fetch-date');
            if (dateEl) {
                const oldestAt = Math.min(...results.map(r => r.at));
                dateEl.textContent = ', as of ' + _fmtDate(oldestAt);
            }

            renderCurrencyToggle();
            buildBuckets(modes[0].id, baseCards, false);

        } catch (e) {
            document.getElementById('loading').textContent = 'Failed to load cards. ' + e.message;
        }
    }

    // ── Bucketing ──────────────────────────────────────────────────
    function assignBuckets(cards, modeConfig) {
        const buckets       = _makeBuckets().map(b => ({ ...b, cards: [] }));
        const noPriceBucket = buckets[buckets.length - 1];

        for (const card of cards) {
            const priceVal = modeConfig?.foilOnly
                ? (card.prices?.usd_foil ?? card.prices?.usd_etched)
                : card.prices?.usd;

            if (!priceVal) {
                noPriceBucket.cards.push(card);
                continue;
            }
            const usd   = parseFloat(priceVal);
            const price = (currencyMode === 'CAD' && typeof fx !== 'undefined')
                ? usd * fx.rates.CAD
                : usd;
            const bucket = buckets.find(b => !b.noPrice && price >= b.min && price < b.max)
                ?? buckets[buckets.length - 2];
            bucket.cards.push(card);
        }
        return buckets;
    }

    // ── Price formatting ───────────────────────────────────────────
    function fmt(val) {
        if (!val || isNaN(parseFloat(val))) return null;
        const usd = parseFloat(val);
        const converted = (currencyMode === 'CAD' && typeof fx !== 'undefined')
            ? usd * fx.rates.CAD
            : usd;
        const rounded = Math.round(converted);
        if (rounded === 0) return '< $1';
        return '$' + (rounded >= 1000 ? rounded.toLocaleString() : rounded);
    }

    // placeholder shown (dimmed) when val is null
    function priceRow(label, val, placeholder) {
        const display = val ?? placeholder;
        if (!display) return '';
        return `<div class="flex justify-between gap-3">
                    <span class="text-white/60">${label}</span>
                    <span class="font-semibold ${val ? 'text-white' : 'text-white/30'}">${display}</span>
                </div>`;
    }

    function combinedFoilRow(card, alwaysShow) {
        const foil   = fmt(card.prices?.usd_foil);
        const etched = fmt(card.prices?.usd_etched);
        if (foil && etched) return priceRow('Foil, Foil Etched', `${foil}, ${etched}`);
        if (foil)           return priceRow('Foil', foil);
        if (etched)         return priceRow('Foil Etched', etched);
        return alwaysShow   ? priceRow('Foil', null, 'no data') : '';
    }

    function priceBlock(card, modeConfig) {
        if (modeConfig?.foilOnly) {
            const foil   = fmt(card.prices?.usd_foil);
            const etched = fmt(card.prices?.usd_etched);
            const val    = foil ?? etched;
            const label  = (foil && etched) ? 'Foil, Foil Etched' : etched ? 'Foil Etched' : 'Foil';
            return priceRow(label, val, 'no data');
        }
        const alwaysShow = !!modeConfig?.alwaysShowNormal;
        return priceRow('Normal', fmt(card.prices?.usd), alwaysShow ? 'no data' : null)
            + combinedFoilRow(card, alwaysShow);
    }

    // ── DOM building ───────────────────────────────────────────────
    function buildBuckets(mode, cards, animate) {
        const modeConfig = modes.find(m => m.id === mode);
        const container  = document.getElementById('buckets');
        const buckets    = assignBuckets(cards, modeConfig);

        if (animate) {
            container.querySelectorAll('.ma-flipper').forEach(f => f.classList.add('flipped'));
            setTimeout(() => {
                container.innerHTML = renderBucketsHTML(mode, buckets, true, modeConfig);
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    container.querySelectorAll('.ma-flipper').forEach(f => f.classList.remove('flipped'));
                }));
            }, 600);
        } else {
            container.innerHTML = renderBucketsHTML(mode, buckets, false, modeConfig);
        }
    }

    function renderBucketsHTML(mode, buckets, startFlipped, modeConfig) {
        const isBase       = mode === modes[0].id;
        const altMap       = isBase ? {} : (altMaps[mode] ?? {});
        const flippedClass = startFlipped ? ' flipped' : '';
        let html = '';

        for (const b of buckets) {
            if (!b.cards.length) continue;

            const cardsHTML = b.cards.map(card => {
                const altCard   = altMap[card.name];
                const imgSrc    = !isBase && altCard?.image_uris?.normal
                    ? altCard.image_uris.normal
                    : card.image_uris?.normal ?? '';
                const priceCard = !isBase && altCard ? altCard : card;

                return `<div class="ma-card flex flex-col gap-1">
                    ${!isBase ? `<div class="text-sm text-white/60 w-full truncate">${card.name}</div>` : ''}
                    <div class="text-sm w-full">${priceBlock(priceCard, modeConfig)}</div>
                    <div style="perspective:800px;">
                        <div class="ma-flipper${flippedClass}">
                            <img class="ma-face ma-front shadow-lg" src="${imgSrc}" alt="${card.name}" loading="lazy">
                            <img class="ma-face ma-back" src="${CARD_BACK}" alt="">
                        </div>
                    </div>
                </div>`;
            }).join('');

            html += `<div class="rounded-lg p-5 backdrop-blur-sm" style="${b.bgStyle}">
                <h2 class="text-lg font-bold text-white/90 mb-4">${b.label}</h2>
                <div class="flex flex-wrap gap-4">${cardsHTML}</div>
            </div>`;
        }
        return html;
    }

    // ── Toggle ─────────────────────────────────────────────────────
    function setMode(mode) {
        if (mode === currentMode || isAnimating) return;
        isAnimating = true;
        currentMode = mode;

        modes.forEach(m => {
            document.getElementById('btn-' + m.id).className =
                m.id === mode ? 'ma-btn-active' : 'ma-btn-inactive';
        });

        const isBase = mode === modes[0].id;
        const cards  = isBase
            ? baseCards
            : baseCards.map(c => altMaps[mode]?.[c.name] ?? c);

        buildBuckets(mode, cards, true);
        setTimeout(() => { isAnimating = false; }, 2200);
    }

    init();
}
