/**
 * catalog.js — shared logic for all catalog pages.
 *
 * Usage: call initCatalog(config) with:
 *   config.modes = [{ id, label, query }, ...]
 *   First mode is the "base" (English); subsequent modes are alt views
 *   matched to base cards by name.
 *
 * HTML page needs:
 *   <div id="mode-toggle" class="ma-toggle mt-4 ring-1 ring-gray-400"></div>
 *   <div id="loading">Loading cards…</div>
 *   <div id="buckets"></div>
 */

const BUCKETS = [
    { label: 'Over $50',      min: 50, max: Infinity },
    { label: 'Over $20',      min: 20, max: 50       },
    { label: 'Over $10',      min: 10, max: 20       },
    { label: 'Over $5',       min: 5,  max: 10       },
    { label: '$1\u2013$5',    min: 1,  max: 5        },
    { label: 'Under $1',      min: 0,  max: 1        },
    { label: 'No prices yet', noPrice: true          },
];

const BG_STYLES = [
    'background: linear-gradient(to bottom, rgba(136,19,55,0.65),  rgba(136,19,55,0.15))',
    'background: linear-gradient(to bottom, rgba(51,65,85,0.65),   rgba(51,65,85,0.15))',
    'background: linear-gradient(to bottom, rgba(30,58,138,0.65),  rgba(30,58,138,0.15))',
    'background: linear-gradient(to bottom, rgba(49,46,129,0.65),  rgba(49,46,129,0.15))',
    'background: linear-gradient(to bottom, rgba(76,29,149,0.65),  rgba(76,29,149,0.15))',
    'background: linear-gradient(to bottom, rgba(31,41,55,0.65),   rgba(31,41,55,0.15))',
    'background: linear-gradient(to bottom, rgba(30,30,35,0.7),    rgba(30,30,35,0.3))',
];

const CARD_BACK = './img/card_default4.png';

function initCatalog(config) {
    const modes = config.modes;

    let baseCards  = [];
    const altMaps  = {}; // mode.id → { name → card }
    let currentMode = modes[0].id;
    let isAnimating = false;

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

    // ── Fetch ──────────────────────────────────────────────────────
    async function init() {
        try {
            const responses = await Promise.all(
                modes.map(m => fetch('https://api.scryfall.com/cards/search?q=' + m.query + '&order=usd&dir=desc'))
            );
            if (!responses[0].ok) throw new Error('Scryfall error ' + responses[0].status);

            const dataArr = await Promise.all(responses.map(r => r.json()));

            baseCards = dataArr[0].data ?? [];
            for (let i = 1; i < modes.length; i++) {
                const map = {};
                for (const card of (dataArr[i].data ?? [])) map[card.name] = card;
                altMaps[modes[i].id] = map;
            }

            document.getElementById('loading').remove();
            buildBuckets(modes[0].id, baseCards, false);

        } catch (e) {
            document.getElementById('loading').textContent = 'Failed to load cards. ' + e.message;
        }
    }

    // ── Bucketing ──────────────────────────────────────────────────
    function assignBuckets(cards) {
        const buckets      = BUCKETS.map((b, i) => ({ ...b, bgStyle: BG_STYLES[i], cards: [] }));
        const noPriceBucket = buckets[buckets.length - 1];

        for (const card of cards) {
            const usd = card.prices?.usd;
            if (!usd) {
                noPriceBucket.cards.push(card);
                continue;
            }
            const price = parseFloat(usd);
            const bucket = buckets.find(b => !b.noPrice && price >= b.min && price < b.max)
                ?? buckets[buckets.length - 2];
            bucket.cards.push(card);
        }
        return buckets;
    }

    // ── Price formatting ───────────────────────────────────────────
    function fmt(val) {
        if (!val || isNaN(parseFloat(val))) return null;
        return '$' + Math.round(parseFloat(val));
    }

    function priceRow(label, val) {
        if (!val) return '';
        return `<div class="flex justify-between gap-3">
                    <span class="text-white/60">${label}</span>
                    <span class="font-semibold text-white">${val}</span>
                </div>`;
    }

    function combinedFoilRow(card) {
        const foil   = fmt(card.prices?.usd_foil);
        const etched = fmt(card.prices?.usd_etched);
        if (foil && etched) return priceRow('Foil, Foil Etched', `${foil}, ${etched}`);
        if (foil)           return priceRow('Foil', foil);
        if (etched)         return priceRow('Foil Etched', etched);
        return '';
    }

    function priceBlock(card) {
        return priceRow('Normal', fmt(card.prices?.usd)) + combinedFoilRow(card);
    }

    // ── DOM building ───────────────────────────────────────────────
    function buildBuckets(mode, cards, animate) {
        const container = document.getElementById('buckets');
        const buckets   = assignBuckets(cards);

        if (animate) {
            container.querySelectorAll('.ma-flipper').forEach(f => f.classList.add('flipped'));
            setTimeout(() => {
                container.innerHTML = renderBucketsHTML(mode, buckets, true);
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    container.querySelectorAll('.ma-flipper').forEach(f => f.classList.remove('flipped'));
                }));
            }, 600);
        } else {
            container.innerHTML = renderBucketsHTML(mode, buckets, false);
        }
    }

    function renderBucketsHTML(mode, buckets, startFlipped) {
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
                    <div class="text-xs w-full">${priceBlock(priceCard)}</div>
                    <div style="perspective:800px;">
                        <div class="ma-flipper${flippedClass}">
                            <img class="ma-face ma-front shadow-lg" src="${imgSrc}" alt="${card.name}" loading="lazy">
                            <img class="ma-face ma-back" src="${CARD_BACK}" alt="">
                        </div>
                    </div>
                </div>`;
            }).join('');

            html += `<div class="rounded-2xl p-5 backdrop-blur-sm" style="${b.bgStyle}">
                <h2 class="text-base font-bold text-white/90 mb-4">${b.label}</h2>
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
