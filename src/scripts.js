packTotal = 0;
boostersBought = 0;
commonSum = 0;
uncommonSum = 0;
currencyMode = "";
currentSet = "FIN";
cardBack_URL = "img/card_default4.png";
activeInvestigation = false;
activeAbout = false;
activeSubInfo = false;

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

    if (currentSet === "DSK") {
        pullDSK();
    } else if (currentSet === "MH3") {
        pullMH3();
    } else if (currentSet === "FIN") {
        pullFIN();
    } else {
        pullFDN();
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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
    singleHolder.classList.add("opacity-100");
    ghostDataGrab(ghostLinkHalf_FIN, topOutLink_FIN);

    const investigateButton = document.getElementById("investigate");
    investigateButton.classList.remove("hidden");
    investigateButton.classList.remove("opacity-0");

    // Set Infopop Data
    const infopopsContent = document.querySelectorAll(".infopop-content");

    infopopsContent.forEach((content) => {
        let infopopID = content.closest(".card-info").id.replace("-label", "");
        if (infopopID === "uncommon-set") {
            content.querySelector(".infopop-name").textContent = window.cardInfo?.["uncommon"][0];
            content.querySelector(".infopop-rarity").textContent = "Appears " + window.cardInfo?.["common"][1] + " of the time. ";
        } else if (infopopID === "common-set") {
            content.querySelector(".infopop-name").textContent = window.cardInfo?.["common"][0];
            content.querySelector(".infopop-rarity").textContent = "Appears " + window.cardInfo?.["uncommon"][1] + " of the time. ";
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
            investigateButton.innerText = "Investigate";
        });
        activeInvestigation = false;
    } else {
        infopops.forEach((infopop) => {
            infopop.classList.remove("hidden");
            infopop.classList.remove("opacity-0");
            investigateButton.innerText = "Hide";
        });
        umamiAnalytics("Investigate");
        activeInvestigation = true;
    }
}

// Load DOM content, then execute
document.addEventListener(
    "DOMContentLoaded",

    function init() {
        const singleHolder = document.getElementById("single-holder");
        const singleStack = document.querySelector(".both-cards-single");
        const shade = document.querySelector(".shade");
        const kofi = document.getElementById("kofi");
        const kofiSingle = document.getElementById("kofi-single");

        const aboutContainer = document.getElementById("about-container");
        const aboutModal = document.getElementById("about-modal");
        const aboutButton = document.getElementById("about");
        const mainInfo = document.getElementById("main-info");
        const subInfo = document.getElementById("sub-info");
        const getSubInfo = document.getElementById("explainer");
        const backToMainInfo = document.getElementById("back-to-main");

        // Click info, get modal
        aboutButton.addEventListener("click", function (e) {
            umamiAnalytics("About modal");
            aboutContainer.classList.remove("hidden");
            activeAbout = true;
        });

        // Hover kofi link, show single
        kofi.addEventListener("mouseover", function (e) {
            kofiSingle.classList.remove("hidden");
        });
        kofi.addEventListener("mouseout", function (e) {
            kofiSingle.classList.add("hidden");
        });

        // Click details, get hide main info, reveal sub info
        getSubInfo.addEventListener("click", function (e) {
            umamiAnalytics("Read sub-info");
            subInfo.classList.remove("hidden");
            mainInfo.classList.add("hidden");
            getSubInfo = true;
        });

        // Add umami tracking to Kofi
        kofi.addEventListener("click", function (e) {
            umamiAnalytics("Kofi link");
        });

        // Click back, show main info, hide sub
        backToMainInfo.addEventListener("click", function (e) {
            subInfo.classList.add("hidden");
            mainInfo.classList.remove("hidden");
            getSubInfo = false;
        });

        document.addEventListener("click", function (event) {
            if (!activeAbout) return;
            if (!aboutModal.contains(event.target) && event.target !== aboutButton) {
                aboutContainer.classList.add("hidden");
                subI = false;
            }
        });

        document.addEventListener("keydown", (event) => {
            if (activeAbout && event.key === "Escape") {
                aboutContainer.classList.add("hidden");
                activeAbout = false;
            }
        });

        let singleClicked = false;

        let cardsRemaining = setName.totalCards;
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

        if (getCookie("currentSet")) {
            if (getCookie("currentSet") == "'MH3'") {
                setMH3();
            } else if (getCookie("currentSet") == "'DSK'") {
                setDSK();
            } else if (getCookie("currentSet") == "'FIN'") {
                setFIN();
            } else {
                setFDN();
            }
        } else {
            // In the case of no cookie, set FIN
            setFIN();
        }

        function initializeCAD() {
            currencyMode = "CAD";
            umamiAnalytics("Convert to CAD");
            toggle.classList.add("toggle-cad");
            boosterValue = CAN_boosterValue;
            document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
            currentMoneyElement.classList.remove("px-3");
            console.log("Initializing cad...");
            console.log("currency mode = " + currencyMode);
        }

        function initializeUSD() {
            document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
            currentMoneyElement.classList.remove("px-3");
        }

        // On load, if a CAD cookie exist, initialize to CAD and set toggle visually.
        // If USD cookie, do nothing, load as normal.
        // If no cookie yet, set cookie
        if (getCookie("currencyMode")) {
            if (getCookie("currencyMode") == "'CAD'") {
                console.log("Canadian Loonie gang");
                initializeCAD();
                toggle.classList.toggle("on");
            } else {
                initializeUSD();
                currentMoneyElement.classList.remove("px-3");
            }
        } else {
            currencyMode = "USD";
            document.cookie = "currencyMode = 'USD'";
            initializeUSD();
        }

        // Toggle click event
        function initializeMoney() {
            // Initialize all values
            boostersBought = 0;
            packTotal = 0;
            commonSum = 0;
            uncommonSum = 0;
            myPrices = [];
            document.getElementById("boosters-bought").innerText = "--";
            document.getElementById("current-money").innerText = "$ --";
            currentMoneyElement.classList.remove("bg-rose-500", "bg-emerald-500", "px-3");

            // Initialize to CAD settings if toggled while on USD and vice-versa.
            if (getCookie("currencyMode") == "'USD'") {
                initializeCAD();
                document.cookie = "currencyMode = 'CAD'";
                window.location.reload();
            } else {
                initializeUSD();
                document.cookie = "currencyMode = 'USD'";
                document.getElementById("pricePerBooster").innerText = USDollar.format(boosterValue);
                window.location.reload();
            }
            toggle.classList.toggle("on");
        }

        toggle.addEventListener("click", () => {
            initializeMoney();
        });
    },
    false
);

// Card maker
function clearMoney() {
    currentSetElement = document.getElementById("current-set");
    currentMoneyElement = document.getElementById("current-money");

    // Toggle click event
    function initializeMoney() {
        // Initialize all values
        boostersBought = 0;
        packTotal = 0;
        commonSum = 0;
        uncommonSum = 0;
        myPrices = [];
        document.getElementById("boosters-bought").innerText = "--";
        document.getElementById("current-money").innerText = "$ --";
        currentMoneyElement.classList.remove("bg-rose-500", "bg-emerald-500", "px-3");
    }

    initializeMoney();
}

function clearSlots() {
    const cardSection = document.getElementById("card-section");
    while (cardSection.childElementCount > 1) {
        cardSection.removeChild(cardSection.lastChild);
    }

    // Clear Ghost Card and associated material
    document.getElementById("snark").classList.add("hidden");
    document.getElementById("ghost-image").src = cardBack_URL;
    // document.getElementById("foil-holder").style.display = "none";
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
    cardInfo.classList.add("card-info", "flex", "items-end", "sm:text-base", "text-xs", "pb-1.5");
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
        let stackHeightValue = quantity * 40 + 412;
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
                foilMulti.classList.add("foil-hold", "foil-gradient", "foil-in-list");
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
}

function setGhostData() {
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

    ghostFoilHolderElement = document.getElementById("foil-holder");
    ghostTexturedElement = document.getElementById("ghost-textured");

    //  Set treatment
    const ghostFoilElement = document.getElementById("ghost-foil");

    // If only foil price exists...show foil gradient
    if (ghostCard.promo_types.includes("surgefoil") && ghostCard.prices.usd_foil) {
        ghostFoilElement.innerText = "surge foil ";
        ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil)).toFixed(0);
        ghostFoilHolderElement.classList.add("foil-gradient", "surge-gradient");
    } else if (ghostCard.prices.usd_foil && ghostCard.prices.usd == null) {
        ghostFoilElement.innerText = "foil ";
        ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil)).toFixed(0);
        // ghostTexturedElement.classList.add("block");
        // ghostTexturedElement.classList.remove("hidden");
        ghostFoilHolderElement.classList.add("foil-gradient");

        //  If foil price exists and it's within price range...show foil gradient.
    } else if (ghostCard.foil && ghostCard.prices.usd_foil >= boosterSpendBottom && ghostCard.prices.usd_foil <= boosterSpendTop) {
        ghostFoilElement.innerText = "foil ";
        ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil)).toFixed(0);
        ghostFoilHolderElement.classList.add("foil-gradient");

        //  If the card is foil, but the non-foil price exists and is within range..."".
    } else if (ghostCard.foil && ghostCard.prices.usd >= boosterSpendBottom && ghostCard.prices.usd <= boosterSpendTop) {
        // console.log("The single is regular");
        // ghostFoilHolderElement.classList.remove("foil-gradient");
        ghostFoilElement.innerText = "";
        ghostTexturedElement.classList.remove("block");
        ghostTexturedElement.classList.add("hidden");
        ghostFoilHolderElement.classList.remove("foil-gradient");

        //  Otherwise, also nothing.
    } else {
        console.log("The single is super regular and not in range.");
        ghostFoilElement.innerText = "";
        ghostTexturedElement.classList.remove("block");
        ghostTexturedElement.classList.add("hidden");
        ghostFoilHolderElement.classList.remove("foil-gradient");
    }

    if (ghostCard.frame == "1997") {
        ghostTreatment = "retro frame ";
        // } else if (ghostCard.promo_types[0]) {
        //   ghostTreatment = "borderless concept art ";
    } else if (ghostCard.border_color == "borderless") {
        ghostTreatment = "borderless ";
    } else if (ghostCard.finishes[0] == "etched") {
        ghostTreatment = "etched ";
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

    // Add Boosters Bought
    totalBoosterSpend = boostersBought * boosterValue;
    boosterSpendTop = convertToUSD(totalBoosterSpend + totalBoosterSpend * 0.15);
    boosterSpendBottom = convertToUSD(totalBoosterSpend - totalBoosterSpend * 0.15);

    // boosterSpendTop = 400;
    // boosterSpendBottom = 401;

    try {
        const result = await fetch(topOutLink); // assume this returns an object or undefined
    } catch (error) {
        if (1 === 1) {
            // 🔥 This code runs ONLY when that specific error happens
            console.warn("Caught undefined access99999:", error);

            // Your custom response
            //   handleMissingData();
            console.log("my custom RESPONSE" + result);
        } else {
            // Re-throw or handle other errors
            throw error;
        }
    }

    console.log("Looking for a single between " + boosterSpendBottom + " and " + boosterSpendTop);

    ghostLinkConstructed = ghostLinkHalf + "%28USD>" + boosterSpendBottom + "+and+USD<" + boosterSpendTop + "%29&unique=cards";
    console.log("GHOST CONSTRUCTED: " + ghostLinkConstructed);

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
            isSurge = ghostCard.promo_types.includes("surgefoil");

            if (ghostCard.prices.usd == !null) {
                ghostPrice = convertCurrency(Number(ghostCard.prices.usd) * priceCut);
            } else if (isSurge) {
                ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil) * priceCut);
            } else {
                ghostPrice = convertCurrency(Number(ghostCard.prices.usd_foil) * priceCut);
            }
            console.log("Total Booster Spend: " + totalBoosterSpend + ". Ghost Price: " + ghostPrice);
            if (totalBoosterSpend <= ghostPrice) {
                ghostLink = ghostLinkConstructed;
                console.log("Getting NON-TOP Card!");

                // Get the non-top card
                ghostCard = fetch(ghostLinkConstructed)
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        ghostCard = data;
                        ghostName = data.name;
                        setGhostData();
                    });
            } else {
                ghostLink = ghostCard;
                ghostName = ghostCard.name;

                setGhostData();
            }
        })
        .catch((error) => console.error(error));

    //  Replace Img Source
    ghostImageElement = document.getElementById("ghost-image");

    //  Wait for manually Ghost Image to load, then set image.
    await waitforme(800);
    ghostImageElement.src = ghostImagePrimary;

    //  Insert Price
    const ghostPriceElement = document.getElementById("ghost-price");
    ghostPriceElement.innerText = ghostPrice;

    //  Insert Name
    const ghostNameElement = document.getElementById("ghost-name");
    ghostNameElement.innerText = ghostName;
}

const setName = window[window.setName];
let cardsRemaining = setName.totalCards;

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

    cardsRemaining = setName.totalCards;
    cardsLoadingNumber.innerText = cardsRemaining;

    boosterTotalValue = boostersBought * boosterValue;
    const boostersBoughtElement = document.getElementById("boosters-bought");
    boostersBoughtElement.innerText = boostersBought + (" (" + USDollar.format(boosterTotalValue) + ")");

    function checkIfFinished() {
        return myPrices.length >= setName.totalCards;
    }

    var timeout = setInterval(function () {
        cardsLoadingNumber.innerText = cardsRemaining;

        if (checkIfFinished()) {
            clearInterval(timeout);
            isFinished = true;

            loadingOverlay.classList.remove("z-10", "loader-blur-effect");
            loadingOverlay.classList.add("-z-10", "opacity-0");

            const commonSumElement = document.getElementById("common-sum");
            commonSumElement.innerText = "$" + commonSum.toFixed(2);
            commonSum = 0;

            //  Sum up all prices in array
            myPrices.forEach((num) => {
                packTotal += num;
            });
            runningSum.innerText = USDollar.format(packTotal);

            let netTotal = packTotal - boosterTotalValue;
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
    cardsLoadingNumber.innerText = setName.totalCards;
}
