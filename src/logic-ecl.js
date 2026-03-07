const ghostLinkHalf_ECL = "https://api.scryfall.com/cards/random?q=%28set%3Aecl+or+set%3Aspg%29+date%3A2026-01-23+unique%3Aprints+";
const topOutLink_ECL = "https://api.scryfall.com/cards/search?order=usd&q=%28set%3Aecl+or+set%3Aspg%29+date%3A2026-01-23+unique%3Aprints+USD%3E%3D15";
const boosterType_ECL = "Collector";

window.setName = "ECL";
window.ECL = {
    totalCards: 15,
    totalCards_PLAY: 14,
};
window.cardInfo = window.cardInfo || {};

function setECL_Money() {
    if (getCookie("currentBoosterType") === "PLAY") {
        document.cookie = "currentBoosterType = PLAY";
        window.ECL = {
            totalCards: 14,
        };
        boosterValue = getCookie("boosterValue_ECL_PLAY") ? getCookie("boosterValue_ECL_PLAY") : 6;
        CAD_boosterValue = getCookie("boosterValue_CAD_ECL_PLAY") ? getCookie("boosterValue_CAD_ECL_PLAY") : 9;
        msrp = 5.49;

        makeECLPlaySlots();

        document.cookie = "boosterValue_ECL_PLAY = " + boosterValue;
        document.cookie = "boosterValue_CAD_ECL_PLAY = " + CAD_boosterValue;
    } else {
        document.cookie = "currentBoosterType = COLLECTOR";
        window.ECL = {
            totalCards: 15,
        };
        boosterValue = getCookie("boosterValue_ECL") ? getCookie("boosterValue_ECL") : 36;
        CAD_boosterValue = getCookie("boosterValue_CAD_ECL") ? getCookie("boosterValue_CAD_ECL") : 50;
        msrp = 26.99;

        console.log("should be making ECL Collector slots");
        makeECLSlots();
        document.cookie = "boosterValue_ECL = " + boosterValue;
        document.cookie = "boosterValue_CAD_ECL = " + CAD_boosterValue;
    }
}

function setECL() {
    currentSet = "ECL";
    document.cookie = "currentSet = ECL";
    window.boosterType = "both";

    boosterCheck("both");

    priceCutActive = true;
    priceCut = 1;

    document.getElementById("set-header").innerText = "LORWYN ECLIPSED";

    document.body.style.backgroundImage = "url(img/ECL_bg2_dark.jpg)";

    clearSlots();
    setECL_Money();

    clearMoney();
    changeSet();
}

function makeECLSlots() {
    makeSlot("boosterfun", "Foil Booster Fun", true);
    makeSlot("boosterfunnf", "Booster Fun #1");
    makeSlot("boosterfuntwonf", "Booster Fun #2");
    makeSlot("nfcommander", "Non-foil Commander", true);
    makeSlot("raremythic", "Foil Rare or Mythic", true);
    makeSlot("land", "Foil Full-Art Basic Land", true);
    makeSlot("uncommon", "Foil Uncommons", true, 4);
    makeSlot("common", "Foil Commons", true, 5);
}

function makeECLPlaySlots() {
    makeSlot("wildcard", "Foil Wildcard", true);
    makeSlot("raremythic", "Rare or Mythic");
    makeSlot("nfwildcard", "Non-Foil Wildcard");
    makeSlot("uncommon", "Uncommons", false, 3);
    makeSlot("common", "Commons", false, 7);
    makeSlot("land", "Land", true);
}

function pullECL() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_ECL();
        uncommonPull_ECL();
        landPull_ECL();
        rareMythicPull_ECL();
        nfCommanderPull_ECL();
        nfBoosterFunTwoPull_ECL();       
        nfBoosterFunPull_ECL();
        boosterFunPull_ECL();
        sumTotals();
    } else {
        console.log("already working");
    }
}

function pullECL_Play() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_ECLPlay();
        uncommonPull_ECLPlay();
        landPull_ECLPlay();
        nfWildcardPull_ECLPlay();
        rareMythicPull_ECLPlay();
        wildcardPull_ECLPlay();

        sumTotals();
    } else {
        console.log("already working");
    }
}

async function commonPull_ECL() {
    // Clear out all common card divs, if they exist
    commonSet = document.getElementById("common-sup-set");

    //  Get card from Scryfall
    for (k = 1; k < 6; k++) {
        // Random number between 0 and 100
        commonRoll = getRandomNumber(0, 100);
        var commonLink = "";

        commonLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ac+CN<%3D264&unique=cards";
        commonType = "Main set, Common (Foil)";
        commonRarity = "100%";

        let response = await fetch(commonLink);
        let commonCard = await response.json();
        commonName = commonCard.name;

        //  Replace Img Source
        commonImage = commonCard.image_uris.normal;

        var commonImageId = "common-image-" + k;
        commonImageElement = document.getElementById(commonImageId);
        commonImageElement.src = commonImage;

        //  When card has loaded...Flip and wait accordingly
        const commonStack = document.getElementById("common-image-" + k).parentElement;
        commonImageElement.addEventListener("load", cardImageLoaded(commonImageElement, commonImage, commonStack));

        var commonPrice = convertCurrency(commonCard.prices.usd_foil * priceCut);

        //  Create Common Sum Element
        commonSum = commonSum + commonPrice;

        //  Push price to price array
        myPrices.push(commonPrice);
    }

    window.cardInfo.common = ["5 Main-set Commons", "Appears 100% of the time."];

    const commonSumElement = document.getElementById("common-sum");
    commonSumElement.innerText = commonSum;

    // Set Sum on page, clear value.
    commonSumElement.innerText = "$" + commonSum.toFixed(2);
}

async function uncommonPull_ECL() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j < 5; j++) {
        uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au+CN<%3D264&unique=cards";
        uncommonType = "Main set, Uncommon (Foil)";
        uncommonRarity = "100%";

        let response = await fetch(uncommonLink);
        let uncommonCard = await response.json();
        uncommonName = uncommonCard.name;

        //  Replace Img Source, check for DFC
        uncommonImage = uncommonCard.image_uris.normal;

        var uncommonImageId = "uncommon-image-" + j;
        uncommonImageElement = document.getElementById(uncommonImageId);
        uncommonImageElement.src = uncommonImage;

        //  When card has loaded...Flip and wait accordingly
        const uncommonStack = document.getElementById("uncommon-image-" + j).parentElement;
        uncommonImageElement.addEventListener("load", cardImageLoaded(uncommonImageElement, uncommonImage, uncommonStack));

        var uncommonPrice = convertCurrency(uncommonCard.prices.usd_foil * priceCut);

        //  Create Uncommon Sum Element
        uncommonSum = uncommonSum + uncommonPrice;

        //  Push price to price array
        myPrices.push(uncommonPrice);
    }

    window.cardInfo.uncommon = ["4 Main-set Uncommons", "Appears 100% of the time."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}


async function landPull_ECL() {

    landLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+%28CN>%3D274+AND+CN<%3D283%29+unique%3Aart";
    landType = "Full-art basic land (Foil)";
    landRarity = "100%";

    let response = await fetch(landLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    landName = card.name;
    window.cardInfo.land = [landName, landType, landRarity];

    var landImageElement = document.getElementById("land-image").previousElementSibling;

    // Add foil effect if foil
    landImageElement.classList.add("foil-gradient");

    // Set price, foil price if foil
    landPrice = Number(card.prices.usd_foil * priceCut);

    //   Replace Img Source
    landImagePrimary = card.image_uris.normal;
    document.getElementById("land-image").src = landImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const landStack = landImageElement.closest(".both-cards");
    landImageElement.addEventListener("load", cardImageLoaded(landImageElement, landImagePrimary, landStack));

    //  Insert Price
    const landPriceElement = document.getElementById("land-price");
    landPriceElement.innerText = USDollar.format(landPrice);

    //  Insert Roll
    const landRollElement = document.getElementById("land-roll");
    landRollElement.innerText = "N/A";

    //  Push price to price array
    myPrices.push(landPrice);
}

async function rareMythicPull_ECL() {
    // Random number between 0 and 100
    rareMythicRoll = getRandomNumber(0, 100);
    var rareMythicLink = "";

    // Override roll
    // rareMythicRoll = 99.1;

    if (rareMythicRoll <= 85.7) {
        // Foil full-art land
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+CN<%3D268&unique=cards";
        rareMythicType = "Default frame, Rare (Foil)";
        rareMythicRarity = "85.5%";
    } else {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+CN<%3D268&unique=cards";
        rareMythicType = "Default frame, Mythic (Foil)";
        rareMythicRarity = "14.5%";
    }

    let response = await fetch(rareMythicLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    rareMythicName = card.name;
    window.cardInfo.raremythic = [rareMythicName, rareMythicType, rareMythicRarity];

    var rareMythicImageElement = document.getElementById("raremythic-image").previousElementSibling;

    rareMythicImageElement.classList.add("foil-gradient");

    // Set price, foil price if foil
    rareMythicPrice = Number(card.prices.usd_foil * priceCut);

    //   Replace Img Source, check for DFC
    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        rareMythicImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        rareMythicImagePrimary = card.image_uris.normal;
    }
    document.getElementById("raremythic-image").src = rareMythicImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const rareMythicStack = rareMythicImageElement.closest(".both-cards");
    rareMythicImageElement.addEventListener("load", cardImageLoaded(rareMythicImageElement, rareMythicImagePrimary, rareMythicStack));

    //  Insert Price
    const rareMythicPriceElement = document.getElementById("raremythic-price");
    rareMythicPriceElement.innerText = USDollar.format(rareMythicPrice);

    //  Push price to price array
    myPrices.push(rareMythicPrice);
}

async function nfCommanderPull_ECL() {
    // Random number between 0 and 100
    nfCommanderRoll = getRandomNumber(0, 100);
    var nfCommanderLink = "";

    // Override roll
    // nfCommanderRoll = 99.1;

    if (nfCommanderRoll <= 91) {
        // Foil full-art land
        nfCommanderLink = "https://api.scryfall.com/cards/random?q=set%3AECC+rarity%3Ar+%28CN>%3D25+AND+CN<%3D44%29&unique=cards";
        nfCommanderType = "Extended-art Commader, Rare";
        nfCommanderRarity = "91%";
    }  else {
        nfCommanderLink = "https://api.scryfall.com/cards/random?q=set%3AECC+rarity%3Am+%28CN>%3D1+AND+CN<%3D4%29&unique=cards";
        nfCommanderType = "Borderless Commander, Mythic";
        nfCommanderRarity = "9%";
    }

    let response = await fetch(nfCommanderLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfCommanderName = card.name;
    window.cardInfo.nfcommander = [nfCommanderName, nfCommanderType, nfCommanderRarity];

    var nfCommanderImageElement = document.getElementById("nfcommander-image").previousElementSibling;
    nfCommanderImageElement.classList.remove("foil-gradient");

    // Set price
    nfCommanderPrice = Number(card.prices.usd * priceCut);

    //   Replace Img Source, check for DFC
    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        nfCommanderImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        nfCommanderImagePrimary = card.image_uris.normal;
    }
    document.getElementById("nfcommander-image").src = nfCommanderImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const nfCommanderStack = nfCommanderImageElement.closest(".both-cards");
    nfCommanderImageElement.addEventListener("load", cardImageLoaded(nfCommanderImageElement, nfCommanderImagePrimary, nfCommanderStack));

    //  Insert Price
    const nfCommanderPriceElement = document.getElementById("nfcommander-price");
    nfCommanderPriceElement.innerText = USDollar.format(nfCommanderPrice);

    //  Push price to price array
    myPrices.push(nfCommanderPrice);
}

async function nfBoosterFunPull_ECL() {
    // Random number between 0 and 100
    nfBoosterFunRoll = getRandomNumber(0, 100);
    var nfBoosterFunLink = "";

    // Override roll
    // nfBoosterFunRoll = 94.9;

    if (nfBoosterFunRoll <= 37.7) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D353+AND+CN<%3D381%29&unique=cards";
        nfBoosterFunType = "Extended-art, Rare";
        nfBoosterFunRarity = "37.7%";
    } else if (nfBoosterFunRoll <= 71.4) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D297+AND+CN<%3D346%29&unique=cards";
        nfBoosterFunType = "Fable frame, Rare";
        nfBoosterFunRarity = "33.7%";
    } else if (nfBoosterFunRoll <= 80.5) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D297+AND+CN<%3D346%29&unique=cards";
        nfBoosterFunType = "Fable frame, Mythic";
        nfBoosterFunRarity = "9.1%";
    } else if (nfBoosterFunRoll <= 93.5) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D284+AND+CN<%3D296%29&unique=cards";
        nfBoosterFunType = "Borderless nonland, Rare";
        nfBoosterFunRarity = "13%";
    } else if (nfBoosterFunRoll <= 98) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D284+AND+CN<%3D296%29&unique=cards";
        nfBoosterFunType = "Borderless nonland, Mythic";
        nfBoosterFunRarity = "4.5%";
    }  else {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D347AND+CN<%3D351%29&unique=cards";
        nfBoosterFunType = "Borderless reversible shock land";
        nfBoosterFunRarity = "10.4%";
    }

    let response = await fetch(nfBoosterFunLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfBoosterFunName = card.name;
    window.cardInfo[`boosterfunnf`] = [nfBoosterFunName, nfBoosterFunType, nfBoosterFunRarity];
    nfBoosterFunPrice = convertCurrency(card.prices.usd * priceCut);

    // TO FIX: figure out if DFC....
    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        nfBoosterFunImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        nfBoosterFunImagePrimary = card.image_uris.normal;
    }

    //   Replace Img Source
    var nfBoosterFunImageId = "boosterfunnf-image";
    document.getElementById(nfBoosterFunImageId).src = nfBoosterFunImagePrimary;
    nfBoosterFunImageElement = document.getElementById(nfBoosterFunImageId);
    nfBoosterFunImageElement.src = nfBoosterFunImagePrimary;

    //  When card has loaded...Flip and wait accordingly
    let nfBoosterFunStack = document.getElementById("boosterfunnf-image").closest(".both-cards");
    nfBoosterFunImageElement.addEventListener("load", cardImageLoaded(nfBoosterFunImageElement, nfBoosterFunImagePrimary, nfBoosterFunStack));

    //  Insert Price
    const nfBoosterFunPriceElement = document.getElementById("boosterfunnf-price");
    nfBoosterFunPriceElement.innerText = USDollar.format(nfBoosterFunPrice);

    //  Push price to price array
    myPrices.push(nfBoosterFunPrice);
}

async function nfBoosterFunTwoPull_ECL() {
    // Random number between 0 and 100
    nfBoosterFunTwoRoll = getRandomNumber(0, 100);
    var nfBoosterFunTwoLink = "";

    // Override roll
    // nfBoosterFunRoll = 94.9;

    if (nfBoosterFunTwoRoll <= 37.7) {
        nfBoosterFunTwoLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D353+AND+CN<%3D381%29&unique=cards";
        nfBoosterFunTwoType = "Extended-art, Rare";
        nfBoosterFunTwoRarity = "37.7%";
    } else if (nfBoosterFunTwoRoll <= 71.4) {
        nfBoosterFunTwoLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D297+AND+CN<%3D346%29&unique=cards";
        nfBoosterFunTwoType = "Fable frame, Rare";
        nfBoosterFunTwoRarity = "33.7%";
    } else if (nfBoosterFunTwoRoll <= 80.5) {
        nfBoosterFunTwoLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D297+AND+CN<%3D346%29&unique=cards";
        nfBoosterFunTwoType = "Fable frame, Mythic";
        nfBoosterFunTwoRarity = "9.1%";
    } else if (nfBoosterFunTwoRoll <= 93.5) {
        nfBoosterFunTwoLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D284+AND+CN<%3D296%29&unique=cards";
        nfBoosterFunTwoType = "Borderless nonland, Rare";
        nfBoosterFunTwoRarity = "13%";
    } else if (nfBoosterFunTwoRoll <= 98) {
        nfBoosterFunTwoLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D284+AND+CN<%3D296%29&unique=cards";
        nfBoosterFunTwoType = "Borderless nonland, Mythic";
        nfBoosterFunTwoRarity = "4.5%";
    }  else {
        nfBoosterFunTwoLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D347AND+CN<%3D351%29&unique=cards";
        nfBoosterFunTwoType = "Borderless reversible shock land";
        nfBoosterFunTwoRarity = "10.4%";
    }

    let response = await fetch(nfBoosterFunTwoLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfBoosterFunTwoName = card.name;
    window.cardInfo[`boosterfuntwonf`] = [nfBoosterFunTwoName, nfBoosterFunTwoType, nfBoosterFunTwoRarity];
    nfBoosterFunTwoPrice = convertCurrency(card.prices.usd * priceCut);

    // TO FIX: figure out if DFC....
    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        nfBoosterFunTwoImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        nfBoosterFunTwoImagePrimary = card.image_uris.normal;
    }

    //   Replace Img Source
    var nfBoosterFunTwoImageId = "boosterfuntwonf-image";
    document.getElementById(nfBoosterFunTwoImageId).src = nfBoosterFunTwoImagePrimary;
    nfBoosterFunTwoImageElement = document.getElementById(nfBoosterFunTwoImageId);
    nfBoosterFunTwoImageElement.src = nfBoosterFunTwoImagePrimary;

    //  When card has loaded...Flip and wait accordingly
    let nfBoosterFunTwoStack = document.getElementById("boosterfuntwonf-image").closest(".both-cards");
    nfBoosterFunTwoImageElement.addEventListener("load", cardImageLoaded(nfBoosterFunTwoImageElement, nfBoosterFunTwoImagePrimary, nfBoosterFunTwoStack));

    //  Insert Price
    const nfBoosterFunTwoPriceElement = document.getElementById("boosterfuntwonf-price");
    nfBoosterFunTwoPriceElement.innerText = USDollar.format(nfBoosterFunTwoPrice);

    //  Push price to price array
    myPrices.push(nfBoosterFunTwoPrice);
}

async function boosterFunPull_ECL() {
    // Random number between 0 and 100
    boosterFunRoll = getRandomNumber(0, 100);
    var boosterFunLink = "";

    // Override roll
    // boosterFunRoll = 78;

    if (boosterFunRoll <= 30.4) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D353+AND+CN<%3D381%29";
        boosterFunType = "Extended art, Rare (Foil)";
        boosterFunRarity = "30.4";
    } else if (boosterFunRoll <= 57.6) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D297+AND+CN<%3D346%29";
        boosterFunType = "Fable frame, Rare (Foil)";
        boosterFunRarity = "27.2%";
    } else if (boosterFunRoll <= 64.9) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D297+AND+CN<%3D346%29";
        boosterFunType = "Fable frame, Mythic (Foil)";
        boosterFunRarity = "7.3%";
    } else if (boosterFunRoll <= 70.1) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D284+AND+CN<%3D296%29";
        boosterFunType = "Borderless nonland, Rare (Foil)";
        boosterFunRarity = "5.2%";
    } else if (boosterFunRoll <= 74.3) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D284+AND+CN<%3D296%29";
        boosterFunType = "Borderless nonland, Mythic (Foil)";
        boosterFunRarity = "4.2%";
    } else if (boosterFunRoll <= 79.5) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D347+AND+CN<%3D351%29";
        boosterFunType = "Borderless reversible shock land, (Foil)";
        boosterFunRarity = "5.2%";
    } else if (boosterFunRoll <= 90) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspg+date%3A2026-01-23";
        boosterFunType = "Special Guests (Foil)";
        boosterFunRarity = "10.5%";
    } else if (boosterFunRoll <= 99) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+%28CN>%3D382+AND+CN<%3D391%29";
        boosterFunType = "Japan Showcase (Foil)";
        boosterFunRarity = "9%";
    } else {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+%28CN>%3D392+AND+CN<%3D401%29";
        boosterFunType = "Japan Showcase (Fracture Foil)";
        boosterFunRarity = "1%";
    }

    let response = await fetch(boosterFunLink);

    //  waits until Scryfall fetch completes...
    let card = await response.json();
    boosterFunName = card.name;
    window.cardInfo.boosterfun = [boosterFunName, boosterFunType, boosterFunRarity];

    var boosterFunImageElement = document.getElementById("boosterfun-image");

    //  Add foil effect if foil
    boosterFunImageElement.previousElementSibling.classList.add("foil-gradient");

    //  Set price, foil price if foil
    boosterFunPrice = Number(card.prices.usd_foil * priceCut);

    //  Replace Img Source, check for DFC
    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        boosterFunImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        boosterFunImagePrimary = card.image_uris.normal;
    }
    document.getElementById("boosterfun-image").src = boosterFunImagePrimary;

    //  When Image has loaded...Flip and wait accordingly
    const boosterFunStack = boosterFunImageElement.closest(".both-cards");
    boosterFunImageElement.addEventListener("load", cardImageLoaded(boosterFunImageElement, boosterFunImagePrimary, boosterFunStack));

    //  Insert Price
    const boosterFunPriceElement = document.getElementById("boosterfun-price");
    boosterFunPriceElement.innerText = USDollar.format(boosterFunPrice);

    //  Push price to price array
    myPrices.push(boosterFunPrice);
}

// ...
// Play Booster functions!
// ...

async function commonPull_ECLPlay() {
    for (i = 1; i <= 7; i++) {
        commonLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ac+-type%3Abasic";

        // If source material hits...
        if (i === 7) {
            sourceRoll = getRandomInt(1, 55);
            if (sourceRoll === 1) {
                commonLink = "https://api.scryfall.com/cards/random?q=set%3Aspg+date%3A2026-01-23";
            } else {
                commonLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ac+-type%3Abasic";
            }
        }

        let response = await fetch(commonLink);
        let commonCard = await response.json();

        window.cardInfo.common = ["6-7 Main-set Commons", "In every 1 of 55 Play Boosters, a Special Guests card replaces one of these Commons."];

        commonName = commonCard.name;
        commonPrice = convertCurrency(commonCard.prices.usd * priceCut);

        //  Set img source
        commonImage = commonCard.image_uris.normal;

        var commonImageId = "common-image-" + i;
        commonImageElement = document.getElementById(commonImageId);
        commonImageElement.src = commonImage;

        //  When card has loaded...Flip and wait accordingly
        const commonStack = document.getElementById("common-image-" + i).parentElement;
        commonImageElement.addEventListener("load", cardImageLoaded(commonImageElement, commonImage, commonStack));

        //  Create Common Sum Element
        commonSum = commonSum + commonPrice;

        //  Push price to price array
        myPrices.push(commonPrice);
    }
    const commonSumElement = document.getElementById("common-sum");
    commonSumElement.innerText = commonSum;

    // Set Sum on page, clear value.
    commonSumElement.innerText = "$" + commonSum.toFixed(2);
    // commonSum = 0;
}

async function uncommonPull_ECLPlay() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j <= 3; j++) {
        uncommonRoll = getRandomNumber(0, 100);
        var uncommonLink = "";

        // Override roll
        // uncommonRoll = 2;

        if (uncommonRoll <= 90) {
            // 4 Scene cards from Main set
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au";
            uncommonType = "Scene, Uncommon";
            uncommonRarity = "90%";
        } else {
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au+%28CN>%3D297+AND+CN<%3D346%29";
            uncommonType = "Uncommon";
            uncommonRarity = "10%";
        }

        // set:fdn rarity:u (is:booster OR border:borderless)
        let response = await fetch(uncommonLink);
        let uncommonCard = await response.json();
        uncommonName = uncommonCard.name;

        //  Replace Img Source, check for DFC
        uncommonImage = uncommonCard.image_uris.normal;

        var uncommonImageId = "uncommon-image-" + j;
        uncommonImageElement = document.getElementById(uncommonImageId);
        uncommonImageElement.src = uncommonImage;

        //  When card has loaded...Flip and wait accordingly
        const uncommonStack = document.getElementById("uncommon-image-" + j).parentElement;
        uncommonImageElement.addEventListener("load", cardImageLoaded(uncommonImageElement, uncommonImage, uncommonStack));

        var uncommonPrice = convertCurrency(uncommonCard.prices.usd * priceCut);

        //  Create Uncommon Sum Element
        uncommonSum = uncommonSum + uncommonPrice;

        //  Push price to price array
        myPrices.push(uncommonPrice);
    }

    window.cardInfo.uncommon = ["3 Main-set Uncommons", "10 Uncommon fable frame cards can also be found in these slots (10% chance)."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function nfWildcardPull_ECLPlay() {
    // Random number between 0 and 100
    nfWildcardRoll = getRandomNumber(0, 100);

    // Override roll
    // nfWildcardRoll = 99.4;

    if (nfWildcardRoll <= 18) {
        nfWildcardType = "Default frame, Common";
        nfWildcardRarity = "18%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ac+CN<%3D268";
    } else if (nfWildcardRoll <= 76) {
        nfWildcardType = "Default frame, Uncommon";
        nfWildcardRarity = "58%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au+CN<%3D268";
    } else if (nfWildcardRoll <= 95) {
        nfWildcardType = "Default frame, Rare";
        nfWildcardRarity = "19%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+CN<%3D268";
    } else if (nfWildcardRoll <= 97) {
        nfWildcardType = "Default frame, Mythic";
        nfWildcardRarity = "2%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+CN<%3D268";
    } else if (nfWildcardRoll <= 99) {
        nfWildcardType = "Fable frame, Uncommon";
        nfWildcardRarity = "2%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au+%28CN>%3D297+AND+CN<%3D346%29";
    } else if (nfWildcardRoll <= 98.25) {
        nfWildcardType = "Fable frame, Rare";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D297+AND+CN<%3D346%29";
    } else if (nfWildcardRoll <= 99.375) {
        nfWildcardType = "Fable frame, Mythic";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D297+AND+CN<%3D346%29";
    } else if (nfWildcardRoll <= 99.625) {
        nfWildcardType = "Borderless nonland, Rare";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D284+AND+CN<%3D296%29";
    } else if (nfWildcardRoll <= 99.75) {
        nfWildcardType = "Borderless nonland, Mythic";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D284+AND+CN<%3D296%29";
    } else {
        nfWildcardType = "Borderless reversible shock land";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D347+AND+CN<%3D351%29";
    }

    let response = await fetch(nfWildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfWildcardName = card.name;
    window.cardInfo.nfwildcard = [nfWildcardName, nfWildcardType, nfWildcardRarity];
    nfWildcardPrice = convertCurrency(card.prices.usd * priceCut);

    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        nfWildcardImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        nfWildcardImagePrimary = card.image_uris.normal;
    }

    //   Replace Img Source
    var nfWildcardImageId = "nfwildcard-image";
    document.getElementById(nfWildcardImageId).src = nfWildcardImagePrimary;
    nfWildcardImageElement = document.getElementById(nfWildcardImageId);
    nfWildcardImageElement.src = nfWildcardImagePrimary;

    //  When card has loaded...Flip and wait accordingly
    let nfWildcardStack = document.getElementById("nfwildcard-image").closest(".both-cards");
    nfWildcardImageElement.addEventListener("load", cardImageLoaded(nfWildcardImageElement, nfWildcardImagePrimary, nfWildcardStack));

    //  Insert Price
    const nfWildcardElement = document.getElementById("nfwildcard-price");
    nfWildcardElement.innerText = USDollar.format(nfWildcardPrice);

    //  Push price to price array
    myPrices.push(nfWildcardPrice);
}

async function rareMythicPull_ECLPlay() {
    // Random number between 0 and 100
    rareMythicRoll = getRandomNumber(0, 100);
    var rareMythicLink = "";

    // Override roll
    // rareMythicRoll = 99.1;

    if (rareMythicRoll <= 78.2) {
        // Foil full-art land
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+CN<%3D268";
        rareMythicType = "Default frame, Rare";
        rareMythicRarity = "78.2%";
    } else if (rareMythicRoll <= 91.8) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+CN<%3D268";
        rareMythicType = "Default frame, Mythic";
        rareMythicRarity = "13.6%";
    } else if (rareMythicRoll <= 96.4) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D297+AND+CN<%3D346%29";
        rareMythicType = "Fable frame, Rare";
        rareMythicRarity = "4.6%";
    } else if (rareMythicRoll <= 97.6) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D297+AND+CN<%3D346%29";
        rareMythicType = "Fable frame, Mythic";
        rareMythicRarity = "1.2%";
    } else if (rareMythicRoll <= 98.45) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D284+AND+CN<%3D296%29";
        rareMythicType = "Borderless nonland, Rare";
        rareMythicRarity = "< 1%";
    } else if (rareMythicRoll <= 99.15) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D284+AND+CN<%3D296%29";
        rareMythicType = "Borderless nonland, Mythic";
        rareMythicRarity = "< 1%";
    } else  {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D347+AND+CN<%3D351%29";
        rareMythicType = "Borderless reversible shock land";
        rareMythicRarity = "< 1%";
    }

    let response = await fetch(rareMythicLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    rareMythicName = card.name;
    window.cardInfo.raremythic = [rareMythicName, rareMythicType, rareMythicRarity];

    var rareMythicImageElement = document.getElementById("raremythic-image");

    // Set price, foil price if foil
    rareMythicPrice = Number(card.prices.usd_foil * priceCut);

    //   Replace Img Source
    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        rareMythicImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        rareMythicImagePrimary = card.image_uris.normal;
    }
    document.getElementById("raremythic-image").src = rareMythicImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const rareMythicStack = rareMythicImageElement.closest(".both-cards");
    rareMythicImageElement.addEventListener("load", cardImageLoaded(rareMythicImageElement, rareMythicImagePrimary, rareMythicStack));

    //  Insert Price
    const rareMythicPriceElement = document.getElementById("raremythic-price");
    rareMythicPriceElement.innerText = USDollar.format(rareMythicPrice);

    //  Push price to price array
    myPrices.push(rareMythicPrice);
}

async function wildcardPull_ECLPlay() {
    // Random number between 0 and 100
    wildcardRoll = getRandomNumber(0, 100);

    // Override roll
    // wildcardRoll = 99.4;

    if (wildcardRoll <= 60.4) {
        wildcardType = "Default frame, Common (Foil)";
        wildcardRarity = "60.4%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ac+CN<%3D268";
    } else if (wildcardRoll <= 90.2) {
        wildcardType = "Default frame, Uncommon (Foil)";
        wildcardRarity = "29.8%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au+CN<%3D268";
    } else if (wildcardRoll <= 96.7) {
        wildcardType = "Default frame, Rare (Foil)";
        wildcardRarity = "6.5%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+CN<%3D268";
    } else if (wildcardRoll <= 97.8) {
        wildcardType = "Default frame, Mythic (Foil)";
        wildcardRarity = "1.1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+CN<%3D268";
    } else if (wildcardRoll <= 98.8) {
        wildcardType = "Fable frame, Uncommon (Foil)";
        wildcardRarity = "1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Au+%28CN>%3D297+AND+CN<%3D346%29";
    } else if (wildcardRoll <= 99.8) {
        wildcardType = "Fable frame, Rare (Foil)";
        wildcardRarity = "1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D297+AND+CN<%3D346%29";
    } else if (wildcardRoll <= 99.84) {
        wildcardType = "Fable frame, Mythic (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D297+AND+CN<%3D346%29";
    } else if (wildcardRoll <= 99.9) {
        wildcardType = "Borderless nonland, Rare (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D284+AND+CN<%3D296%29";
    } else if (wildcardRoll <= 99.94) {
        wildcardType = "Borderless nonland, Mythic (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Am+%28CN>%3D284+AND+CN<%3D296%29";
    } else {
        wildcardType = "Borderless reversible shock land";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+rarity%3Ar+%28CN>%3D347+AND+CN<%3D351%29";
    }

    let response = await fetch(wildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    wildcardName = card.name;
    window.cardInfo.wildcard = [wildcardName, wildcardType, wildcardRarity];
    wildcardPrice = convertCurrency(card.prices.usd * priceCut);

    if (card.layout == "transform" || card.layout == "modal_dfc" || card.layout == "reversible_card") {
        wildcardImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        wildcardImagePrimary = card.image_uris.normal;
    }

    //   Replace Img Source
    var wildcardImageId = "wildcard-image";
    document.getElementById(wildcardImageId).src = wildcardImagePrimary;
    wildcardImageElement = document.getElementById(wildcardImageId);
    wildcardImageElement.src = wildcardImagePrimary;

    //  When card has loaded...Flip and wait accordingly
    let wildcardStack = document.getElementById("wildcard-image").closest(".both-cards");
    wildcardImageElement.addEventListener("load", cardImageLoaded(wildcardImageElement, wildcardImagePrimary, wildcardStack));
    //  Insert Price
    const wildcardElement = document.getElementById("wildcard-price");
    wildcardElement.innerText = USDollar.format(wildcardPrice);

    //  Push price to price array
    myPrices.push(wildcardPrice);
}

async function landPull_ECLPlay() {
    // Random number between 0 and 100
    landRoll = getRandomNumber(0, 100);
    var landLink = "";

    // Override roll
    // landRoll = 99.1;

    if (landRoll <= 40) {
        // Foil full-art land
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+type%3Abasic";
        landType = "Basic land";
        landRarity = "40%";
    } else if (landRoll <= 50) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+type%3Abasic";
        landType = "Basic land (Foil)";
        landRarity = "10%";
    } else if (landRoll <= 90) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+type%3Abasic+%28CN>%3D274+AND+CN<%3D283%29+unique%3Aart&unique=cards";
        landType = "Full-art basic land";
        landRarity = "40%";
    } else {
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aecl+type%3Abasic+%28CN>%3D274+AND+CN<%3D283%29+unique%3Aart&unique=cards";
        landType = "Full-art basic land (Foil)";
        landRarity = "10%";
    }

    let response = await fetch(landLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    landName = card.name;
    window.cardInfo.land = [landName, landType, landRarity];

    var landImageElement = document.getElementById("land-image").previousElementSibling;

    if (landType.includes("Foil")) {
        // Add foil effect if foil
        landImageElement.classList.add("foil-gradient");
        // Set price, foil price if foil
        landPrice = Number(card.prices.usd_foil * priceCut);
    } else {
        // Add foil effect if foil
        landImageElement.classList.remove("foil-gradient");
        // Set price, foil price if foil
        landPrice = Number(card.prices.usd * priceCut);
    }

    //   Replace Img Source
    landImagePrimary = card.image_uris.normal;
    document.getElementById("land-image").src = landImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const landStack = landImageElement.closest(".both-cards");
    landImageElement.addEventListener("load", cardImageLoaded(landImageElement, landImagePrimary, landStack));

    //  Insert Price
    const landPriceElement = document.getElementById("land-price");
    landPriceElement.innerText = USDollar.format(landPrice);

    //  Push price to price array
    myPrices.push(landPrice);
}