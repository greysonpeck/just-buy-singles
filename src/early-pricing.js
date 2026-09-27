// early-pricing.js — "prices look a little crazy right now" flow for freshly-released
// (or not-yet-released) sets.
//
// A set config opts in via a top-level `earlyPricing` block:
//   { "releasedAt": "YYYY-MM-DD", "windowDays": 21, "discount": 0.25 }
// Any time up through releasedAt + windowDays — including before release, while
// only preorder/speculative prices exist — the first time a session visits that
// set it's asked whether to use current (possibly-inflated) prices or apply a
// flat discount across the board. The choice is remembered in localStorage (per
// set) and can be revisited later via a checkbox on the price-edit modal (see
// settings.js).

function _earlyPricingStorageKey(code) {
    return 'earlyPricingChoice_' + code;
}

// Returns null when the set has no earlyPricing config; otherwise the config
// merged with `inWindow` (bool) — whether "now" falls before the window closes.
function getEarlyPricingWindow(config) {
    const ep = config && config.earlyPricing;
    if (!ep) return null;
    const releaseMs = new Date(ep.releasedAt + 'T00:00:00Z').getTime();
    const daysSince = (Date.now() - releaseMs) / 86400000;
    const windowDays = ep.windowDays ?? 21;
    return Object.assign({}, ep, { inWindow: daysSince <= windowDays });
}

function _setEarlyPricingBanner(active, discount) {
    const banner = document.getElementById('alert-message');
    if (!banner) return;
    if (active) {
        banner.textContent = 'Singles prices adjusted (-' + Math.round(discount * 100) + '%)';
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

// Applies a choice ('current' | 'adjusted'), persists it for the set, and updates
// the banner. Like the currency toggle, this only affects prices computed from
// this point forward — it doesn't retroactively rescale an already-pulled pack.
function applyEarlyPricingChoice(code, choice, config) {
    localStorage.setItem(_earlyPricingStorageKey(code), choice);
    const ep = config.earlyPricing;
    priceCutActive = true;
    priceCut = choice === 'adjusted' ? (1 - ep.discount) : 1;
    _setEarlyPricingBanner(choice === 'adjusted', ep.discount);
}

// Current set/config the visible modal (if any) applies to. Buttons are wired
// once and read from this shared, mutable context rather than re-attaching a
// fresh listener (with a fresh closure) every time the modal is shown.
let _earlyPricingCtx = null;

function _chooseEarlyPricing(choice) {
    if (!_earlyPricingCtx) return;
    const { code, config } = _earlyPricingCtx;
    umamiAnalytics(choice === 'adjusted' ? 'Prices: Adjusted (-25%)' : 'Prices: Normal');
    applyEarlyPricingChoice(code, choice, config);
    document.getElementById('early-pricing-container').classList.add('hidden');
    document.removeEventListener('keydown', _trapEarlyPricingFocus);
    _earlyPricingCtx = null;
}

function _wireEarlyPricingButtonsOnce() {
    const currentBtn = document.getElementById('early-pricing-current-btn');
    const adjustedBtn = document.getElementById('early-pricing-adjusted-btn');
    if (!currentBtn || !adjustedBtn || currentBtn.dataset.wired) return;
    currentBtn.dataset.wired = '1';
    adjustedBtn.dataset.wired = '1';
    currentBtn.addEventListener('click', () => _chooseEarlyPricing('current'));
    adjustedBtn.addEventListener('click', () => _chooseEarlyPricing('adjusted'));
}

// Keeps Tab/Shift+Tab cycling between the modal's own focusable elements
// (the two option buttons) instead of leaking out to the page underneath.
function _trapEarlyPricingFocus(e) {
    if (e.key !== 'Tab') return;
    const modal = document.getElementById('early-pricing-modal');
    const focusables = modal.querySelectorAll('button');
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}

function _showEarlyPricingModal(code, config, win) {
    const container = document.getElementById('early-pricing-container');
    if (!container) return;

    _wireEarlyPricingButtonsOnce();
    _earlyPricingCtx = { code, config };

    const pct = Math.round(win.discount * 100);
    document.getElementById('early-pricing-adjusted-title').textContent = 'Use adjusted prices (-' + pct + '%)';
    document.getElementById('early-pricing-adjusted-btn').setAttribute('aria-label', 'Use adjusted prices, ' + pct + '% lower');

    container.classList.remove('hidden');
    document.addEventListener('keydown', _trapEarlyPricingFocus);

    // Focus the dialog container itself, not either option — neither choice
    // should look pre-selected when the modal opens.
    document.getElementById('early-pricing-modal').focus();
}

// Called from initSet() once the config for `code` is loaded. Decides whether to
// silently apply a remembered choice, silently do nothing (outside the window),
// or prompt the user with the modal (no choice on record yet, still in window).
function maybeInitEarlyPricing(code, config) {
    const win = getEarlyPricingWindow(config);
    if (!win || !win.inWindow) {
        _setEarlyPricingBanner(false);
        return;
    }

    const stored = localStorage.getItem(_earlyPricingStorageKey(code));
    if (stored === 'current' || stored === 'adjusted') {
        applyEarlyPricingChoice(code, stored, config);
        return;
    }

    priceCut = 1;
    _setEarlyPricingBanner(false);
    _showEarlyPricingModal(code, config, win);
}
