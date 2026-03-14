packsTotal = 0;
boostersBought = 0;
commonSum = 0;
uncommonSum = 0;
currencyMode = "";
currentSet = "SPM";
cardBack_URL = "img/card_default4.png";
activeInvestigation = false;
activeAbout = false;
activeSubInfo = false;
activeFeedback = false;
firstLoad = true;
failSwitch = false;

const ghostLinkHalf = {
    MH3: ghostLinkHalf_MH3,
};

const topOutLink = {
    MH3: topOutLink_MH3,
};

function umamiAnalytics(umamiEvent) {
    try {
        umami.track(umamiEvent);
    } catch (error) {
        console.error("Error with tracking, skipping (maybe uBlock Origin?) Error: ", error);
    }
}

function waitforme(millisec) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("");
        }, millisec);
    });
}

const getRandomNumber = (min, max) => {
    return Math.random() * (max - min) + min;
};

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

myPrices = [];

var activeCheck = false;

function pullBooster() {
    // umamiAnalytics("Pull " + currentSet + " booster");

    // Migrated sets: use JSON-driven engine
    const _migratedConfig = _configCache[currentSet];
    if (_migratedConfig) {
        if (activeCheck) return;
        activeCheck = true;
        document.querySelector("#sound-slider").value = 10;
        pullBoosterFromConfig(_migratedConfig, localStorage.getItem("currentBoosterType") || _migratedConfig.boosterTypes[0]);
        return;
    }

    // Legacy sets (removed one-by-one as each migrates to JSON)
    if (currentSet === "DSK") {
        pullDSK();
    } else if (currentSet === "MH3") {
        pullMH3();
    } else if (currentSet === "FIN") {
        pullFIN();
    } else if (currentSet === "EOE" && localStorage.getItem("currentBoosterType") === "COLLECTOR") {
        pullEOE();
    } else if (currentSet === "EOE" && localStorage.getItem("currentBoosterType") === "PLAY") {
        pullEOE_Play();
    } else if (currentSet === "SPM" && localStorage.getItem("currentBoosterType") === "COLLECTOR") {
        pullSPM();
    } else if (currentSet === "SPM" && localStorage.getItem("currentBoosterType") === "PLAY") {
        pullSPM_Play();
    } else if (currentSet === "TLA" && localStorage.getItem("currentBoosterType") === "COLLECTOR") {
        pullTLA();
    } else if (currentSet === "TLA" && localStorage.getItem("currentBoosterType") === "PLAY") {
        pullTLA_Play();
    } else if (currentSet === "ECL" && localStorage.getItem("currentBoosterType") === "COLLECTOR") {
        pullECL();
    } else if (currentSet === "ECL" && localStorage.getItem("currentBoosterType") === "PLAY") {
        pullECL_Play();
    } else {
        pullFDN();
    }
}


function convertCurrency(value) {
    if (currencyMode == "CAD") {
        value = fx(value).from("USD").to("CAD").toFixed(2);
        return Number(value);
    } else {
        value = value.toFixed(2);
        return Number(value);
    }
}

function convertToUSD(value) {
    if (currencyMode == "CAD") {
        value = fx(value).from("CAD").to("USD").toFixed(2);
        return Number(value);
    } else {
        return Number(value);
    }
}

let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

function ghostSlide() {
    const singleHolder = document.getElementById("single-holder");
    document.getElementById("single-holder").classList.remove("hidden");
    singleHolder.classList.add("opacity-100");

    // Migrated sets: pull ghost card data from JSON config
    let _ghostLink, _topOutLinkVal;
    const _migratedConfig = _configCache[currentSet];
    if (_migratedConfig) {
        const _bt = localStorage.getItem("currentBoosterType") || _migratedConfig.boosterTypes[0];
        const _boosterConfig = _migratedConfig.boosters[_bt];
        if (_boosterConfig && _boosterConfig.ghostCard) {
            _ghostLink = "https://api.scryfall.com/cards/random?q=" + _boosterConfig.ghostCard.randomQuery;
            _topOutLinkVal = "https://api.scryfall.com/cards/search?order=usd&q=" + _boosterConfig.ghostCard.topOutQuery;
        }
    } else {
        _ghostLink = ghostLinkHalf[currentSet];
        _topOutLinkVal = topOutLink[currentSet];
    }
    if (!_ghostLink) return;
    ghostDataGrab(_ghostLink, _topOutLinkVal);

    const investigateButton = document.getElementById("investigate");
    investigateButton.classList.remove("hidden", "opacity-0", "cursor-default");
    investigateButton.classList.add("cursor-pointer");

    if (firstLoad === true) {
        investigateButton.addEventListener("click", () => {
            investigate();
        });
        firstLoad = false;
    }

    // Set Infopop Data
    const infopopsContent = document.querySelectorAll(".infopop-content");

    infopopsContent.forEach((content) => {
        let infopopID = content.closest(".card-info").id.replace("-label", "");

        if (infopopID === "uncommon-set") {
            content.querySelector(".infopop-name").textContent = window.cardInfo?.["uncommon"][0];
            content.querySelector(".infopop-rarity").textContent = window.cardInfo?.["uncommon"][1];
        } else if (infopopID === "common-set") {
            content.querySelector(".infopop-name").textContent = window.cardInfo?.["common"][0];
            content.querySelector(".infopop-rarity").textContent = window.cardInfo?.["common"][1];
        } else if (infopopID === "commonsup-set") {
            content.querySelector(".infopop-name").textContent = window.cardInfo?.["commonsup"][0];
            content.querySelector(".infopop-rarity").textContent = window.cardInfo?.["commonsup"][1];
        } else {
            content.querySelector(".infopop-name").textContent = window.cardInfo?.[infopopID][0];
            content.querySelector(".infopop-type").textContent = window.cardInfo?.[infopopID][1];
            content.querySelector(".infopop-rarity").textContent = "Appears " + window.cardInfo?.[infopopID][2] + " of the time. ";
        }

        // text.innerText = window.cardInfo?.[infopopID];
    });
}

//  Toggle pop-ups on button press.

function investigate() {
    const infopops = document.querySelectorAll(".infopop-wrapper");
    const investigateButton = document.getElementById("investigate");

    if (activeInvestigation) {
        infopops.forEach((infopop) => {
            infopop.classList.add("hidden");
            infopop.classList.add("opacity-0");
        });
        investigateButton.innerText = "Investigate";
        activeInvestigation = false;
    } else {
        infopops.forEach((infopop) => {
            infopop.classList.remove("hidden");
            infopop.classList.remove("opacity-0");
        });
        investigateButton.innerText = "Hide";
        // umamiAnalytics("Investigate");
        activeInvestigation = true;
    }
}

// Load DOM content, then execute
document.addEventListener(
    "DOMContentLoaded",

    async function init() {
        const singleHolder = document.getElementById("single-holder");
        const singleStack = document.querySelector(".both-cards-single");
        const shade = document.querySelector(".shade");
        const kofi = document.getElementById("kofi");
        const kofiSingle = document.getElementById("kofi-single");
        const more = document.getElementById("more");

        const aboutContainer = document.getElementById("about-container");
        const aboutModal = document.getElementById("about-modal");
        const aboutButton = document.getElementById("about");

        const feedbackContainer = document.getElementById("feedback-container");
        const feedbackModal = document.getElementById("feedback-modal");
        const feedbackButton = document.getElementById("feedback");

        const mainInfo = document.getElementById("main-info");
        const subInfo = document.getElementById("sub-info");
        const getSubInfo = document.getElementById("explainer");
        const backToMainInfo = document.getElementById("back-to-main");

        // Top actions scroll, reposition
        window.addEventListener("scroll", function () {
            const topActions = document.getElementById("top-actions");
            const scrollThreshold = 50; // pixels

            if (window.scrollY > scrollThreshold) {
                topActions.classList.remove("top-nav");
                topActions.classList.add("bottom-nav");
            } else {
                topActions.classList.remove("bottom-nav");
                topActions.classList.add("top-nav");
            }
        });

        // Click Feedback, get modal
        feedbackButton.addEventListener("click", function (e) {
            umamiAnalytics("Feedback");
            feedbackContainer.classList.remove("hidden");
            activeFeedback = true;
        });

        // Click About, get modal
        aboutButton.addEventListener("click", function (e) {
            umamiAnalytics("About modal");
            aboutContainer.classList.remove("hidden");
            activeAbout = true;
        });

        // Hover kofi link, show single
        kofi.addEventListener("mouseover", function (e) {
            // Hiding the hover for now
            // kofiSingle.classList.remove("hidden");
        });
        kofi.addEventListener("mouseout", function (e) {
            kofiSingle.classList.add("hidden");
        });

        // Click details, get hide main info, reveal sub info
        getSubInfo.addEventListener("click", function (e) {
            umamiAnalytics("Read sub-info");
            subInfo.classList.remove("hidden");
            mainInfo.classList.add("hidden");
            viewSubInfo = true;
        });

        // Add umami tracking to Kofi
        kofi.addEventListener("click", function (e) {
            umamiAnalytics("Kofi link");
        });

        // Click back, show main info, hide sub
        backToMainInfo.addEventListener("click", function (e) {
            subInfo.classList.add("hidden");
            mainInfo.classList.remove("hidden");
            viewSubInfo = false;
        });

        document.addEventListener("click", function (event) {
            if (!activeFeedback) return;
            if (!feedbackModal.contains(event.target) && event.target !== feedbackButton) {
                feedbackContainer.classList.add("hidden");
                activeFeedback = false;
            }
        });

        document.addEventListener("keydown", (event) => {
            if (activeAbout && event.key === "Escape") {
                aboutContainer.classList.add("hidden");
                activeAbout = false;
            }
        });

        document.addEventListener("click", function (event) {
            if (!activeAbout) return;
            if (!aboutModal.contains(event.target) && event.target !== aboutButton) {
                aboutContainer.classList.add("hidden");
                viewSubInfo = false;
            }
        });

        document.addEventListener("keydown", (event) => {
            if (activeAbout && event.key === "Escape") {
                aboutContainer.classList.add("hidden");
                activeAbout = false;
            }
        });

        // More button
        const setList = document.getElementById("set-list");
        let setListOpen = false;
        more.addEventListener("click", () => {
            setListOpen = true;
            dimBackground();
            setList.classList.remove("hidden");
        });

        // Clicking outside More button
        document.addEventListener("click", function (event) {
            if (!more.contains(event.target) && setListOpen) {
                setList.classList.add("hidden");
                shade.classList.add("opacity-0", "-z-10");
                setListOpen = false;
            }
        });

        const investigateButton = document.getElementById("investigate");
        investigateButton.onclick = null;

        let singleClicked = false;

        if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
            cardsRemaining = setName.totalCards;
        } else {
            cardsRemaining = setName.totalCards_PLAY;
        }

        const cardsLoadingNumber = document.getElementById("cards-loading");
        cardsLoadingNumber.innerText = cardsRemaining;

        function dimBackground() {
            shade.classList.remove("opacity-0", "-z-10");
            // document.querySelector("body").append(shade);
        }

        //  Action on Single Click
        singleHolder.addEventListener("click", () => {
            umamiAnalytics("Single reveal");
            singleClicked = true;
            document.querySelector("body").classList.add("cursor-pointer");
            singleHolder.classList.add("single-view");

            singleStack.classList.remove("flipped");
            dimBackground();

            //  Reveal snark
            const snarkBox = document.getElementById("snark");
            snarkBox.classList.remove("hidden");
        });

        //  Action on Clicking Outside
        document.addEventListener("click", function (event) {
            singleHolder;
            if (!singleHolder.contains(event.target) && singleClicked) {
                singleHolder.classList.remove("single-view");
                singleStack.classList.add("flipped");
                shade.classList.add("opacity-0", "-z-10");
                document.querySelector("body").classList.remove("cursor-pointer");
                document.getElementById("snark").classList.add("hidden");
            }
        });

        currentMoneyElement = document.getElementById("current-money");
        const toggle = document.getElementById("currency");

        if (localStorage.getItem("currentSet")) {
            const _savedSet = localStorage.getItem("currentSet");
            if (window.MIGRATED_SETS && window.MIGRATED_SETS.includes(_savedSet)) {
                await initSet(_savedSet);
            } else if (_savedSet == "MH3") {
                setMH3();
            } else if (_savedSet == "DSK") {
                // handled by MIGRATED_SETS above
            } else if (_savedSet == "FIN") {
                // handled by MIGRATED_SETS above
            } else if (_savedSet == "EOE") {
                // handled by MIGRATED_SETS above
            } else if (_savedSet == "SPM") {
                // handled by MIGRATED_SETS above
            } else if (_savedSet == "TLA") {
                // handled by MIGRATED_SETS above
            } else if (_savedSet == "ECL") {
                // handled by MIGRATED_SETS above
            } else {
                setECL();
            }
        } else {
            console.log("run 3");

            setECL();
        }

        // Pull the set that's in the cookie
        // const pullSet = "set" + currentSet;

        // if (typeof window[pullSet] === "function") {
        //     window[pullSet]();
        //     document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
        // } else {
        //     console.error(`Function ${pullSet} does not exist.`);
        // }

        // Style the set selector
        // const currentButton = document.getElementById("set-" + currentSet);
        // currentButton.classList.remove("bg-slate-700/50");
        // currentButton.classList.add("bg-slate-700/20");

        function initializeCAD() {
            currencyMode = "CAD";
            umamiAnalytics("Convert to CAD");
            toggle.classList.add("toggle-cad");
            boosterValue = CAD_boosterValue;
            document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
            currentMoneyElement.classList.remove("px-3");
        }

        function initializeUSD() {
            document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
            currentMoneyElement.classList.remove("px-3");
        }

        // On load, if a CAD cookie exist, initialize to CAD and set toggle visually.
        // If USD cookie, do nothing, load as normal.
        // If no cookie yet, set cookie
        if (localStorage.getItem("currencyMode")) {
            if (localStorage.getItem("currencyMode") == "CAD") {
                initializeCAD();
                toggle.classList.toggle("on");
            } else {
                initializeUSD();
                currentMoneyElement.classList.remove("px-3");
            }
        } else {
            currencyMode = "USD";
            localStorage.setItem('currencyMode', 'USD');
            initializeUSD();
        }

        // Toggle click event
        function initializeMoney() {
            // Initialize all values
            boostersBought = 0;
            packsTotal = 0;
            commonSum = 0;
            uncommonSum = 0;
            myPrices = [];
            document.getElementById("boosters-bought").innerText = "--";
            document.getElementById("current-money").innerText = "$ --";

            currentMoneyElement.classList.remove("bg-rose-500", "bg-emerald-500", "px-3");

            // Initialize to CAD settings if toggled while on USD and vice-versa.
            if (localStorage.getItem("currencyMode") == "USD") {
                initializeCAD();
                localStorage.setItem('currencyMode', 'CAD');
                window.location.reload();
            } else {
                initializeUSD();
                localStorage.setItem('currencyMode', 'USD');
                document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
                window.location.reload();
            }

            toggle.classList.toggle("on");
        }

        toggle.addEventListener("click", () => {
            initializeMoney();
        });

        document.getElementById("msrp").innerText = "MSRP: " + USDollar.format(msrp) + " USD";

        function boosterToggle() {
            clearSlots();

            boosterCheck(window.boosterType);

            if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
                collectorButton.classList.add("booster-active");
                playButton.classList.remove("booster-active");
            } else {
                playButton.classList.add("booster-active");
                collectorButton.classList.remove("booster-active");
                playButton.classList.add("booster-active");
            }

            if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
                cardsRemaining = setName.totalCards;
            } else {
                cardsRemaining = setName.totalCards_PLAY;
            }

            setID = localStorage.getItem("currentSet");
            const moneySet = "set" + setID + "_Money";
            window[moneySet]();

            document.getElementById("msrp").innerText = "MSRP: " + USDollar.format(msrp) + " USD";

            cookieSearch =
                "boosterValue" +
                (localStorage.getItem("currencyMode") === "CAD" ? "_CAD_" : "_") +
                localStorage.getItem("currentSet") +
                (localStorage.getItem("currentBoosterType") === "PLAY" ? "_PLAY" : "");

            console.log(cookieSearch);
            console.log("bing: " + localStorage.getItem(cookieSearch));

            document.getElementById("pricePerBooster").innerText = USDollar.format(localStorage.getItem(cookieSearch));
        }

        // boosterToggle();

        collectorButton.addEventListener("click", () => {
            console.log("collector");
            localStorage.setItem('currentBoosterType', 'COLLECTOR');
            boosterToggle();
        });

        playButton.addEventListener("click", () => {
            console.log("play");
            localStorage.setItem('currentBoosterType', 'PLAY');
            boosterToggle();
        });

        // Responsive button name
        document.querySelectorAll("#booster-types>button").forEach((label) => {
            if (window.screen.width <= 960) {
                label.innerText = label.innerText.replace(" BOOSTER", "");
            } else {
                // nothing
            }
        });
    },
    false
);

function changeSet() {
    umamiAnalytics("Select set: " + currentSet);
    boosterTotalValue = 0;

    if (currencyMode === "CAD") {
        boosterValue = CAD_boosterValue;
    } else {
        // It's USD...
    }

    // Remove single
    if (!firstLoad) {
        document.getElementById("single-holder").classList.add("hidden");
    } else if (document.getElementById("single-holder").classList.contains("hidden")) {
        document.getElementById("single-holder").classList.remove("hidden");
    } else {
    }

    // Clear Investigate
    // const infopops = document.querySelectorAll(".infopop-wrapper");
    const investigateButton = document.getElementById("investigate");
    const infopops = document.querySelectorAll(".infopop-wrapper");

    if (activeInvestigation) {
        infopops.forEach((infopop) => {
            infopop.classList.add("hidden");
            infopop.classList.add("opacity-0");
        });
    } else {
        // Do nothing
    }
    investigateButton.innerText = "Investigate";
    investigateButton.classList.add("opacity-0");

    activeInvestigation = false;

    // Alert for EOE
    alertMessage = document.getElementById("alert-message");
    // currentSet === "EOE" ? alertMessage.classList.remove("hidden") : alertMessage.classList.add("hidden");

    // Make set selectors buttons
    const setButtons = document.getElementsByClassName("set-button");

    for (button of setButtons) {
        const buttonCode = button.id.slice(-3);
        if (buttonCode === "XXX") continue;

        // Replace node to clear any previously attached listeners
        const fresh = button.cloneNode(true);
        button.parentNode.replaceChild(fresh, button);

        const buttonSet = "set" + buttonCode;
        const callSet = () => {
            if (window.MIGRATED_SETS && window.MIGRATED_SETS.includes(buttonCode)) {
                initSet(buttonCode);
            } else {
                window[buttonSet]();
            }
        };

        if (currentSet === buttonCode) {
            fresh.classList.add("bg-white/20");
        } else {
            fresh.classList.remove("bg-white/20");
        }
        fresh.classList.add("cursor-pointer");
        fresh.addEventListener("click", callSet);
    }

    playButton = document.getElementById("play-booster");
    collectorButton = document.getElementById("collector-booster");

    if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
        collectorButton.classList.add("booster-active");
        playButton.classList.remove("booster-active");
    } else {
        playButton.classList.add("booster-active");
        collectorButton.classList.remove("booster-active");
        playButton.classList.add("booster-active");
    }

    document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
}

// Card maker
function clearMoney() {
    currentSetElement = document.getElementById("current-set");
    currentMoneyElement = document.getElementById("current-money");

    // Toggle click event
    function initializeMoney() {
        // Initialize all values
        boostersBought = 0;
        packsTotal = 0;
        commonSum = 0;
        uncommonSum = 0;
        myPrices = [];
        document.getElementById("boosters-bought").innerText = "--";
        document.getElementById("current-money").innerText = "$ --";
        document.getElementById("running-sum").innerText = "";

        currentMoneyElement.classList.remove("bg-rose-500", "bg-emerald-500", "px-3");
    }

    initializeMoney();

    // Smaller text slot labels if long
    document.querySelectorAll(".slot-label").forEach((label) => {
        const len = label.textContent.trim().length;

        if (len > 19) {
            label.classList.add("text-sm");
        } else {
            label.classList.add("text-base");
        }
    });
}

function boosterCheck(type) {
    playBoosterButton = document.getElementById("play-booster");
    if (type === "both") {
        playBoosterButton.classList.remove("hidden");
    } else {
        //
    }
}

function clearSlots() {
    const cardSection = document.getElementById("card-section");
    while (cardSection.childElementCount > 0) {
        cardSection.removeChild(cardSection.lastChild);
    }

    // Clear Ghost Card and associated material
    document.getElementById("snark").classList.add("hidden");
    document.getElementById("ghost-image").src = cardBack_URL;
    // document.getElementById("foil-holder").style.display = "none";

    if (window.boosterType === "both") {
        // Do nothing
    } else if (window.boosterType === "collector") {
        document.getElementById("play-booster").classList.add("hidden");
    } else {
        document.getElementById("play-booster").classList.add("hidden");
    }

    playButton = document.getElementById("play-booster");

    boosterCheck(window.boosterType);
}

function makeSlot(id, label, hasFoil, quantity) {
    const cardSection = document.getElementById("card-section");

    //  Make card container
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container", "perspective-midrange");

    const slotContainer = document.createElement("div");
    slotContainer.classList.add("total-card", "h-[356px]", "w-fit", "text-nowrap", "mb-1", "sm:pt-0");

    const cardInfo = document.createElement("div");
    cardInfo.id = id + "-label";
    cardInfo.classList.add("card-info", "flex", "items-center", "sm:text-base", "text-xs", "pb-1.5");
    const infoPopWrapper =
        '<div class="infopop-wrapper hidden w-0 justify-center align-center"> <div id="infopop-' +
        id +
        '" class="infopop-content bg-slate-950/70 bg-opacity-80"><p class="infopop-name text-lg leading-snug pb-4"></p><p class="infopop-type font-normal pb-2"></p><p class="infopop-rarity font-normal"></p></div></div>';

    cardInfo.innerHTML =
        infoPopWrapper +
        '<div class="slot-label hover:underline hover:cursor-pointer">' +
        label +
        "</div>" +
        '<div id="' +
        id +
        '-price" class="price pr-3 font-bold"></div>' +
        '<div id="' +
        id +
        '-roll" class="hidden"></div>';

    const bothCards = document.createElement("div");
    bothCards.classList.add("both-cards", "flipped");

    const cardBack = document.createElement("img");
    cardBack.classList.add("card", "card-back", "card-face", "rounded-lg", "backface-hidden", "rotate-y-180");
    cardBack.src = cardBack_URL;

    const foilBlock = document.createElement("div");
    foilBlock.classList.add("card-container", "perspective-midrange");
    foilBlock.innerHTML =
        '<div class="both-cards flipped">' +
        '<div class="" style="position:absolute;">' +
        // old stuff
        ' <div class="foil-hold foil-gradient"></div><img id="' +
        id +
        '-image" class="card-default -z-10 rounded-lg" height="auto" src="' +
        cardBack_URL +
        '" alt="some" />' +
        // close div
        "</div>" +
        // hardcode card back
        '<img class="card-back card card-face rounded-lg backface-hidden rotate-y-180" src="' +
        cardBack_URL +
        '">';

    if (quantity) {
        // Quantity stuff
        const cardSet = document.createElement("div");
        let stackHeightValue = quantity * 40 + 324;
        cardSet.id = id + "-set";
        cardSet.classList.add("mb-1", "sm:pt-0", "card-info");

        // Infopops spacer
        infoPopSpacer =
            '<div class="infopop-wrapper hidden w-0 justify-center align-center"> <div id="infopop-' +
            id +
            '" class="infopop-content mb-0 bg-slate-950/70 bg-opacity-80 top-8 rounded-md h-cards-' +
            quantity +
            '"><p class="infopop-name text-lg leading-snug pb-4"></p><p class="infopop-rarity font-normal"></p></div></div>';
        cardSet.insertAdjacentHTML("afterbegin", infoPopSpacer);

        // Check for dummy/spacer slot
        if (quantity && quantity < 1) {
            cardSet.classList.add("sm:hidden", "block");
        } else {
            // nothing
        }
        cardSection.append(cardSet);

        setLabel = document.createElement("div");
        setLabel.classList.add("card-info", "relative", "flex", "items-end", "sm:text-base", "text-xs", "pb-1.5");
        if (quantity < 1) {
            setLabel.innerHTML = "";
        } else {
            setLabel.innerHTML = '<div class="slot-label">' + label + " (" + quantity + ")</div>" + '<div id="' + id + '-sum" class="pr-3 font-bold"></div>';
            cardSet.style.height = stackHeightValue + "px";
        }
        cardSet.append(setLabel);

        for (var i = 0; i < quantity; i++) {
            const perspectiveContainer = document.createElement("div");
            perspectiveContainer.classList.add("card-container", "perspective-midrange");
            cardSet.append(perspectiveContainer);

            const bothContainer = document.createElement("div");
            bothContainer.classList.add("both-cards", "flipped");

            topVar = "top-pos-" + i;

            const cardImg = document.createElement("img");
            cardImg.id = id + "-image-" + (i + 1);
            cardImg.classList.add("card-face", "card-default", "rounded-lg", topVar);
            cardImg.src = cardBack_URL;
            cardImg.alt = "Default Magic card back";

            const card = document.createElement("img");
            card.classList.add("card", "card-back", "card-face", "rounded-lg", "backface-hidden", "rotate-y-180", topVar);
            card.src = cardBack_URL;
            card.id = id + "-" + (i + 1);

            // Nest elements
            perspectiveContainer.append(bothContainer);
            bothContainer.append(cardImg);
            bothContainer.append(card);

            if (hasFoil) {
                bothContainer.classList.add("absolute", topVar);
                cardImg.classList.remove(topVar);
                card.classList.remove(topVar);

                const foilMulti = document.createElement("div");

                foilMulti.classList.add("foil-hold", "foil-gradient", "w-[240px]", "foil-in-list");
                bothContainer.insertBefore(foilMulti, card);
            }
        }
    } else if (hasFoil) {
        cardSection.append(slotContainer);
        slotContainer.append(cardInfo);

        // const foilBlock = document.createElement("div");
        // foilBlock.id = "foil-card";
        // foilBlock.classList.add("effect-block");
        // foilBlock.innerHTML = ' <div class=""></div><img id="foil-image" class="card-default -z-10 rounded-xl" width="240px" height="auto" src="./img/card_default.jpeg" alt="some" />';
        // card.append(foilBlock);

        slotContainer.append(foilBlock);
    } else {
        cardSection.append(slotContainer);
        slotContainer.append(cardInfo);

        // Append Card Container
        slotContainer.append(cardContainer);
        cardContainer.append(bothCards);

        const cardImg = document.createElement("img");
        cardImg.id = id + "-image";
        cardImg.classList.add("card-face", "card-default", "rounded-lg");
        cardImg.src = cardBack_URL;
        cardImg.alt = "Default Magic card back";

        bothCards.append(cardImg);
        bothCards.append(cardBack);
    }

    // Put an ad
    // if (cardSection.childElementCount === 4) {
    //     // Create the container <ins>
    //     var adMid = document.createElement("ins");
    //     adMid.className = "adsbygoogle";
    //     adMid.style = "display:inline-block;width:970px;height:90px";
    //     adMid.setAttribute("data-ad-client", "ca-pub-1084747507972985"); // your AdSense publisher ID
    //     adMid.setAttribute("data-ad-slot", "1234567890"); // your Ad unit slot ID
    //     // adMid.setAttribute("data-ad-format", "auto");
    //     // adMid.setAttribute("data-full-width-responsive", "true");

    //     // Create Ad Holder
    //     adHolder = document.createElement("div");
    //     adHolder.id = "ad-holder-middle";
    //     adHolder.classList.add("ad-holder", "flex", "justify-center", "w-full", "min-h-[90px]");
    //     cardSection.appendChild(adHolder);

    //     // Insert the ad into the DOM
    //     adHolder.insertAdjacentElement("beforeend", adMid);

    //     // Tell AdSense to render the ad
    //     // Delay rendering to ensure width is calculated
    //     setTimeout(() => {
    //         (adsbygoogle = window.adsbygoogle || []).push({});
    //     }, 50);
    // }
}

function setGhostData() {
    ghostFoilHolderElement = document.getElementById("foil-holder");
    ghostTexturedElement = document.getElementById("ghost-textured");
    snarkError = document.getElementById("snark-error");

    if (failSwitch) {
        snarkError.innerText = "Tried to find a single for close to the dollar amount you sunk into packs...but came up empty!";
        document.getElementById("ghost-price").innerText = "";
        document.getElementById("ghost-foil").innerText = "";
        document.getElementById("ghost-treatment").innerText = "";
        document.getElementById("ghost-name").innerText = "";
        document.getElementById("ghost-image").src = "img/failed.png";

        return;
    } else {
        snarkError.innerText = "";
        // No error
    }

    if (ghostName.includes(",")) {
        ghostName = ghostName.substring(0, ghostName.indexOf(","));
    } else {
        // let it rock
    }

    //  Set price, check for etched
    if (ghostCard.tcgplayer_etched_id) {
        ghostPrice = (priceCut * convertCurrency(Number(ghostCard.prices.usd_etched))).toFixed(0);
    } else if (isSurge) {
        ghostPrice = (priceCut * convertCurrency(Number(ghostCard.prices.usd_foil))).toFixed(0);
    } else if (ghostCard.prices.usd) {
        ghostPrice = (priceCut * convertCurrency(Number(ghostCard.prices.usd))).toFixed(0);
    } else {
        ghostPrice = (priceCut * convertCurrency(Number(ghostCard.prices.usd_foil))).toFixed(0);
    }

    //  Set treatment
    const ghostFoilElement = document.getElementById("ghost-foil");

    // If only foil price exists...show foil gradient

    ghostFoilHolderElement.classList.add("foil-gradient");
    ghostPrice = "For $" + ghostPrice + ", you could have just bought this ";

    ghostHasPromoTypes = "promo_types" in ghostCard;
    if (ghostHasPromoTypes) {
        if (ghostCard.promo_types.includes("surgefoil") && ghostCard.prices.usd_foil) {
            ghostFoilElement.innerText = "surge foil ";
            ghostFoilHolderElement.classList.add("surge-gradient");
            ghostFoilHolderElement.classList.remove("mana-gradient");
        } else if (ghostCard.promo_types.includes("manafoil") && ghostCard.prices.usd_foil) {
            ghostFoilElement.innerText = "mana foil ";
            ghostFoilHolderElement.classList.add("mana-gradient");
            ghostFoilHolderElement.classList.remove("surge-gradient");
        } else if (ghostCard.promo_types.includes("galaxyfoil") && ghostCard.prices.usd_foil) {
            ghostFoilElement.innerText = "galaxy foil ";
            ghostFoilHolderElement.classList.add("galaxy-gradient");
            ghostFoilHolderElement.classList.remove("surge-gradient");
        } else if (ghostCard.promo_types.includes("fracturefoil") && ghostCard.prices.usd_foil) {
            ghostFoilElement.innerText = "fracture foil ";
            ghostFoilHolderElement.classList.remove("surge-gradient", "mana-gradient", "galaxy-gradient");
        } else {
            //has promo types, but not the ones we're looking for....
            ghostFoilElement.innerText = "";
            ghostFoilHolderElement.classList.remove("foil-gradient");
        }
    } else if (ghostCard.prices.usd_foil && ghostCard.prices.usd == null) {
        ghostFoilElement.innerText = "foil ";
        ghostFoilHolderElement.classList.remove("surge-gradient", "mana-gradient");

        //  If foil price exists and it's within price range...show foil gradient.
    } else if (ghostCard.foil && ghostCard.prices.usd_foil >= boosterSpendBottom && ghostCard.prices.usd_foil <= boosterSpendTop) {
        ghostFoilElement.innerText = "foil ";
        ghostFoilHolderElement.classList.remove("surge-gradient", "mana-gradient");

        //  If the card is foil, but the non-foil price exists and is within range..."".
    } else if (ghostCard.foil && ghostCard.prices.usd >= boosterSpendBottom && ghostCard.prices.usd <= boosterSpendTop) {
        // ghostFoilHolderElement.classList.remove("foil-gradient");
        ghostFoilElement.innerText = "";
        ghostTexturedElement.classList.remove("block");
        ghostTexturedElement.classList.add("hidden");
        ghostFoilHolderElement.classList.remove("foil-gradient");
        //  Otherwise, also nothing.
    } else {
        ghostFoilElement.innerText = "";
        ghostTexturedElement.classList.remove("block");
        ghostTexturedElement.classList.add("hidden");
        ghostFoilHolderElement.classList.remove("foil-gradient");
    }

    console.log(ghostCard.name);

    if (ghostCard.frame == "1997") {
        ghostTreatment = "retro frame ";
        // } else if (ghostCard.promo_types[0]) {
        //   ghostTreatment = "borderless concept art ";
    } else if (ghostCard.border_color?.includes("borderless")) {
        ghostTreatment = "borderless ";
    } else if (ghostCard.finishes?.includes("etched")) {
        ghostTreatment = "etched ";
    } else if (ghostCard.frame_effects?.includes("showcase")) {
        ghostTreatment = "showcase ";
    } else {
        ghostTreatment = "";
    }

    // TO FIX: figure out if DFC....
    if (ghostCard.layout == "transform" || ghostCard.layout == "modal_dfc") {
        ghostImagePrimary = ghostCard.card_faces[0].image_uris.normal;
    } else {
        ghostImagePrimary = ghostCard.image_uris.normal;
    }

    const ghostTreatmentElement = document.getElementById("ghost-treatment");
    ghostTreatmentElement.innerText = ghostTreatment;
}

async function ghostDataGrab(ghostLinkHalf, topOutLink) {
    // Set prices and link

    console.log(topOutLink);

    // Add Boosters Bought
    totalBoosterSpend = Number(boosterTotalValue);
    boosterSpendTop = convertToUSD(totalBoosterSpend + totalBoosterSpend * 0.2);
    boosterSpendBottom = convertToUSD(totalBoosterSpend - totalBoosterSpend * 0.2);

    ghostLinkConstructed = ghostLinkHalf + "%28USD>" + boosterSpendBottom + "+and+USD<" + boosterSpendTop + "%29&unique=cards";
    // console.log("GHOST LINK HALF: " + ghostLinkHalf);

    fetch(topOutLink)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Could not fetch resource");
            }

            return response.json();
        })

        // First we set the Ghost Card to the TOP PRICE card
        .then((data) => {
            ghostCard = data.data[0];
            isSurge = ghostCard.promo_types?.includes("surgefoil") ?? false;

            if (ghostCard.prices.usd == !null) {
                ghostPrice = convertCurrency(Number(ghostCard.prices.usd) * priceCut);
            } else if (isSurge) {
                ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil) * priceCut);
            } else {
                ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil) * priceCut);
            }
            // console.log("Total Booster Spend: " + totalBoosterSpend + ". Top of the set: " + ghostPrice);
            if (totalBoosterSpend <= ghostPrice) {
                ghostLink = ghostLinkConstructed;
                // console.log("Getting NON-TOP Card!");

                // Get the non-top card
                // console.log("Ghost link: " + ghostLinkConstructed);

                ghostCard = fetch(ghostLinkConstructed)
                    .then((response) => {
                        if (response.status === 404) {
                            // console.log("FAILING NOW");
                            failSwitch = true;
                            setGhostData();
                            return;
                        } else {
                            return response.json();
                        }
                    })
                    .then((data) => {
                        if (failSwitch) {
                            // console.log("fail detected, clearing Card and Name. failSwitch turning false.");
                            ghostCard = "";
                            ghostName = "";
                            ghostPrice = "";
                            setGhostData();
                            failSwitch = false;
                        } else {
                            // console.log("no fail detected. Setting Card and Name");
                            ghostCard = data;
                            ghostName = data.name;
                            setGhostData();

                            //  Replace Img Source
                            ghostImageElement = document.getElementById("ghost-image");

                            //  Wait for manually Ghost Image to load, then set image.
                            // await waitforme(2000);

                            //  Insert Price
                            const ghostPriceElement = document.getElementById("ghost-price");
                            ghostPriceElement.innerText = ghostPrice ? ghostPrice : "";
                            // ghostPriceElement.innerText = ghostPrice;

                            //  Insert Name
                            const ghostNameElement = document.getElementById("ghost-name");
                            ghostNameElement.innerText = ghostName ? ghostName + "." : "";
                            // ghostNameElement.innerText = ghostName;

                            if (ghostPrice) {
                                // We pulled a real card, set the iamge
                                ghostImageElement.src = ghostImagePrimary;
                            } else {
                                // 404'd, don't overwrte the fail image.
                            }
                        }
                    });
            } else {
                ghostLink = ghostCard;
                ghostName = ghostCard.name;

                setGhostData();
            }
        })
        .catch((error) => {
            console.error(error);
        });
}

const setName = window[window.setName];
// let cardsRemaining = setName.totalCards;

const cardImageLoaded = async (cardType, cardImagePrimary, cardStack) => {
    cardsRemaining--;
    // console.log("remaining: " + cardsRemaining);

    cardStack.classList.add("flipped");
    if (!rareFirstFlip) {
        // Not the first flip
        // console.log("Waiting 1400ms before flipping the stack");
        await waitforme(1400);
    } else {
        // first flip
    }

    //  Flipping
    cardStack.classList.remove("flipped");
    cardType.src = cardImagePrimary;
};

function sumTotals() {
    boostersBought++;

    const loadingOverlay = document.getElementById("data-loading");
    const cardsLoadingNumber = document.getElementById("cards-loading");
    const runningSum = document.getElementById("running-sum");

    cardsLoadingNumber.innerText = cardsRemaining;

    boosterTotalValue = Number(boosterTotalValue) + (currencyMode === "CAD" ? Number(CAD_boosterValue) : Number(boosterValue));

    const boostersBoughtElement = document.getElementById("boosters-bought");
    boostersBoughtElement.innerText = boostersBought + (" (" + USDollar.format(boosterTotalValue) + ")");

    function checkIfFinished() {
        if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
            totalCards = setName.totalCards;
        } else {
            totalCards = setName.totalCards_PLAY;
        }
        return myPrices.length >= totalCards;
    }

    var timeout = setInterval(function () {
        cardsLoadingNumber.innerText = cardsRemaining;

        if (checkIfFinished()) {
            clearInterval(timeout);
            isFinished = true;

            if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
                cardsRemaining = setName.totalCards;
            } else {
                cardsRemaining = setName.totalCards_PLAY;
            }

            loadingOverlay.classList.remove("z-10", "loader-blur-effect");
            loadingOverlay.classList.add("-z-10", "opacity-0");

            const commonSumElement = document.getElementById("common-sum");
            commonSumElement.innerText = "$" + commonSum.toFixed(2);
            commonSum = 0;

            let thisPack = 0;

            //  Sum up all prices in array
            myPrices.forEach((num) => {
                if (num >= 1) {
                    packsTotal += num;
                    thisPack += num;
                } else {
                    // Ignore bulk
                }
            });

            // Smaller text slot labels if long
            document.querySelectorAll(".price").forEach((price) => {
                if (price.innerText === "$0.00") {
                    price.innerText = "(no data!)";
                } else {
                    // fine price
                }
            });

            runningSum.innerText = USDollar.format(packsTotal);

            //  Show pack total
            let thisBooster = document.getElementById("this-booster");
            // thisBooster.innerText = USDollar.format(thisPack);

            //  Pack commentary
            let packRatio = thisPack / boosterValue;
            let packComment = "";
            if (packRatio <= 0.25) {
                packComment = "Oh that's awful";
            } else if (packRatio <= 0.5) {
                packComment = "That's not good.";
            } else if (packRatio <= 0.75) {
                packComment = "That's pretty mid.";
            } else if (packRatio <= 1) {
                packComment = "It could be worse.";
            } else if (packRatio <= 1.25) {
                packComment = "That's alright";
            } else if (packRatio <= 1.5) {
                packComment = "That's actually pretty decent.";
            } else if (packRatio <= 1.75) {
                packComment = "That's pretty great!";
            } else {
                packComment = "That's incredible!!";
            }

            // document.getElementById("booster-commentary").innerText = " (" + packComment + ")";

            let netTotal = packsTotal - boosterTotalValue;
            currentMoneyElement.innerText = USDollar.format(netTotal);
            currentMoneyElement.classList.add("px-3");

            if (netTotal > 0) {
                currentMoneyElement.classList.remove("bg-rose-500");
                currentMoneyElement.classList.add("bg-emerald-500");
            } else {
                currentMoneyElement.classList.remove("bg-emerald-500");
                currentMoneyElement.classList.add("bg-rose-500");
            }

            // Clear array
            myPrices = [];
            activeCheck = false;
            rareFirstFlip = false;

            ghostSlide();
        }
    }, 100);

    // Reset "cards remaining" value a moment after the loader fades away
    if (localStorage.getItem("currentBoosterType") === "COLLECTOR") {
        cardsLoadingNumber.innerText = setName.totalCards;
    } else {
        cardsLoadingNumber.innerText = setName.totalCards_PLAY;
    }


}




