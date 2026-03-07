const ghostLinkHalf_SPM = "https://api.scryfall.com/cards/random?q=%28set%3Aspm+or+set%3Amar%29+date%3A2025-09-26+unique%3Aprints+";
const topOutLink_SPM = "https://api.scryfall.com/cards/search?order=usd&q=%28set%3Aspm+or+set%3Amar%29+date%3A2025-09-26+unique%3Aprints+USD%3E%3D15";
const boosterType_SPM = "Collector";

window.setName = "SPM";
window.SPM = {
    totalCards: 15,
    totalCards_PLAY: 14,
};
window.cardInfo = window.cardInfo || {};

function setSPM_Money() {
    if (getCookie("currentBoosterType") === "PLAY") {
        document.cookie = "currentBoosterType = PLAY";
        window.SPM = {
            totalCards: 14,
        };
        boosterValue = getCookie("boosterValue_SPM_PLAY") ? getCookie("boosterValue_SPM_PLAY") : 6;
        CAD_boosterValue = getCookie("boosterValue_CAD_SPM_PLAY") ? getCookie("boosterValue_CAD_SPM_PLAY") : 9;
        msrp = 6.99;

        console.log("should be making SPM Play slots");
        makeSPMPlaySlots();

        document.cookie = "boosterValue_SPM_PLAY = " + boosterValue;
        document.cookie = "boosterValue_CAD_SPM_PLAY = " + CAD_boosterValue;
    } else {
        document.cookie = "currentBoosterType = COLLECTOR";
        window.SPM = {
            totalCards: 15,
        };
        boosterValue = getCookie("boosterValue_SPM") ? getCookie("boosterValue_SPM") : 36;
        CAD_boosterValue = getCookie("boosterValue_CAD_SPM") ? getCookie("boosterValue_CAD_SPM") : 60;
        msrp = 37.99;

        console.log("should be making SPM Collector slots");
        makeSPMSlots();

        document.cookie = "boosterValue_SPM = " + boosterValue;
        document.cookie = "boosterValue_CAD_SPM = " + CAD_boosterValue;
    }
}

function setSPM() {
    currentSet = "SPM";
    document.cookie = "currentSet = SPM";
    window.boosterType = "both";

    boosterCheck("both");

    priceCutActive = true;
    priceCut = 1;

    document.getElementById("set-header").innerText = "MARVEL'S SPIDER-MAN";

    document.body.style.backgroundImage = "url(img/SPM_bg_dark.png)";

    clearSlots();
    setSPM_Money();

    clearMoney();
    changeSet();
}

function makeSPMSlots() {
    // makeSlot("foil", "Foil Wildcard", true);
    makeSlot("boosterfun", "Foil Booster Fun", true);
    makeSlot("sourcematerial", "Source Material", true);
    makeSlot("boosterfun-nf-1", "Booster Fun #1");
    makeSlot("boosterfun-nf-2", "Booster Fun #2");
    makeSlot("raremythic", "Foil Rare or Mythic", true);
    makeSlot("land", "Foil Full-Art Basic Land", true);
    makeSlot("uncommon", "Foil Uncommons", true, 4);
    makeSlot("common", "Foil Commons", true, 5);
}

function makeSPMPlaySlots() {
    makeSlot("wildcard", "Foil Wildcard", true);
    makeSlot("raremythic", "Rare or Mythic");
    makeSlot("nfwildcard", "Non-Foil Wildcard");
    makeSlot("land", "Land", true);
    makeSlot("uncommon", "Uncommons", false, 3);
    makeSlot("common", "Commons", false, 7);
}

function pullSPM() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_SPM();
        uncommonPull_SPM();
        landPull_SPM();
        rareMythicPull_SPM();
        nfBoosterFunPull_SPM();
        sourceMaterialPull_SPM();
        boosterFunPull_SPM();

        sumTotals();
    } else {
        console.log("already working");
    }
}

function pullSPM_Play() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_SPMPlay();
        uncommonPull_SPMPlay();
        landPull_SPMPlay();
        nfWildcardPull_SPMPlay();
        rareMythicPull_SPMPlay();
        wildcardPull_SPMPlay();

        sumTotals();
    } else {
        console.log("already working");
    }
}

async function commonPull_SPM() {
    // Clear out all common card divs, if they exist
    commonSet = document.getElementById("common-set");

    //  Get card from Scryfall
    for (k = 1; k < 6; k++) {
        // Random number between 0 and 100
        commonRoll = getRandomNumber(0, 100);
        var commonLink = "";

        // Override roll
        // commonRoll = 99.1;

        if (commonRoll <= 85.8) {
            // Foil full-art land
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN<181+OR+CN%3D188%29&unique=cards";
            commonType = "Main set, Common (Foil)";
            commonRarity = "85.8%";
        } else if (commonRoll <= 95.2) {
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN>%3D181+AND+CN<%3D186%29&unique=cards";
            commonType = "Two-color land, Common (Foil)";
            commonRarity = "7.1%";
        } else {
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Aspe+rarity%3Ac&unique=cards";
            commonType = "Welcome deck, Common (Foil)";
            commonRarity = "7.1%";
        }

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

    window.cardInfo.common = ["5 Commons", "Main set (85.8%), Two-color land (7.1%), Welcome deck (7.1%)."];

    const commonSumElement = document.getElementById("common-sum");
    commonSumElement.innerText = commonSum;

    // Set Sum on page, clear value.
    commonSumElement.innerText = "$" + commonSum.toFixed(2);
}

async function uncommonPull_SPM() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j < 5; j++) {
        // Random number between 0 and 100
        uncommonRoll = getRandomNumber(0, 100);
        var uncommonLink = "";

        // Override roll
        // uncommonRoll = 99.1;

        if (uncommonRoll <= 87.3) {
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au&unique=cards";
            uncommonType = "Default frame, Uncommon (Foil)";
            uncommonRarity = "87.3%";
        } else if (uncommonRoll <= 95.2) {
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aspe+rarity%3Au+%28CN>%3D1+AND+CN<%3D198%29&unique=cards";
            uncommonType = "Welcome Deck default frame, Uncommon (Foil)";
            uncommonRarity = "7.9%";
        } else {
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
            uncommonType = "Scene, Uncommon (Foil)";
            uncommonRarity = "4.8%";
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

        var uncommonPrice = convertCurrency(uncommonCard.prices.usd_foil * priceCut);

        //  Create Uncommon Sum Element
        uncommonSum = uncommonSum + uncommonPrice;

        //  Push price to price array
        myPrices.push(uncommonPrice);
    }

    window.cardInfo.uncommon = ["4 Uncommons", "Main set (87.3%), Welcome deck (7.9%), Scene (4.8%)."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function landPull_SPM() {
    landLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+type%3Abasic+%28CN>%3D189+AND+CN<%3D193%29&unique=cards";
    landType = "Full-art spiderweb basic land (Foil)";
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

async function rareMythicPull_SPM() {
    // Random number between 0 and 100
    rareMythicRoll = getRandomNumber(0, 100);
    var rareMythicLink = "";

    // Override roll
    // rareMythicRoll = 99.1;

    if (rareMythicRoll <= 77.9) {
        // Foil full-art land
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D1+AND+CN<%3D198%29&unique=cards";
        rareMythicType = "Default frame, Rare (Foil)";
        rareMythicRarity = "77.9%";
    } else if (rareMythicRoll <= 88.9) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D1+AND+CN<%3D198%29&unique=cards";
        rareMythicType = "Default frame, Mythic (Foil)";
        rareMythicRarity = "11%";
    } else if (rareMythicRoll <= 96.3) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspe+rarity%3Ar+%28CN>%3D2+AND+CN<%3D20%29&unique=cards";
        rareMythicType = "Welcome Deck default frame, Rare (Foil)";
        rareMythicRarity = "7.4%";
    } else {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspe+rarity%3Am+%28CN>%3D2+AND+CN<%3D20%29&unique=cards";
        rareMythicType = "Welcome Deck default frame, Mythic (Foil)";
        rareMythicRarity = "3.7%";
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
    if (card.layout == "transform" || card.layout == "modal_dfc") {
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

async function nfBoosterFunPull_SPM() {
    for (l = 1; l < 3; l++) {
        // Random number between 0 and 100
        nfBoosterFunRoll = getRandomNumber(0, 100);
        var nfBoosterFunLink = "";

        // Override roll
        // nfBoosterFunRoll = 94.9;

        if (nfBoosterFunRoll <= 50.8) {
            nfBoosterFunType = "Extended-art, Rare";
            nfBoosterFunRarity = "50.8%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D244+AND+CN<%3D283%29&unique=cards";
        } else if (rareMythicRoll <= 56.2) {
            nfBoosterFunType = "Extended-art, Mythic";
            nfBoosterFunRarity = "5.4%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D244+AND+CN<%3D283%29&unique=cards";
        } else if (nfBoosterFunRoll <= 65.4) {
            nfBoosterFunType = "Web-slinger, Rare";
            nfBoosterFunRarity = "9.2%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
        } else if (nfBoosterFunRoll <= 66.9) {
            nfBoosterFunType = "Web-slinger, Mythic";
            nfBoosterFunRarity = "1.5%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
        } else if (nfBoosterFunRoll <= 82.3) {
            nfBoosterFunType = "Panel, Mythic";
            nfBoosterFunRarity = "15.4%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
        } else if (nfBoosterFunRoll <= 85.4) {
            nfBoosterFunType = "Panel, Mythic";
            nfBoosterFunRarity = "3.1%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
        } else if (nfBoosterFunRoll <= 90) {
            nfBoosterFunType = "Scene, Rare";
            nfBoosterFunRarity = "4.6%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
        } else if (nfBoosterFunRoll <= 90.8) {
            nfBoosterFunType = "Scene, Mythic";
            nfBoosterFunRarity = "0.8%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
        } else {
            nfBoosterFunType = "Scene Box, Rare";
            nfBoosterFunRarity = "9.2%";
            nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspe+rarity%3Ar+%28CN>%3D21+AND+CN<%3D26%29&unique=cards";
        }

        let response = await fetch(nfBoosterFunLink);

        // waits until Scryfall fetch completes...
        let card = await response.json();
        nfBoosterFunName = card.name;
        window.cardInfo[`boosterfun-nf-${l}`] = [nfBoosterFunName, nfBoosterFunType, nfBoosterFunRarity];
        nfBoosterFunPrice = convertCurrency(card.prices.usd * priceCut);

        // TO FIX: figure out if DFC....
        if (card.layout == "transform" || card.layout == "modal_dfc") {
            nfBoosterFunImagePrimary = card.card_faces[0].image_uris.normal;
        } else {
            nfBoosterFunImagePrimary = card.image_uris.normal;
        }

        //   Replace Img Source
        var nfBoosterFunImageId = "boosterfun-nf-" + l + "-image";
        document.getElementById(nfBoosterFunImageId).src = nfBoosterFunImagePrimary;
        nfBoosterFunImageElement = document.getElementById(nfBoosterFunImageId);
        nfBoosterFunImageElement.src = nfBoosterFunImagePrimary;

        //  When card has loaded...Flip and wait accordingly
        let nfBoosterFunStack = document.getElementById("boosterfun-nf-" + l + "-image").closest(".both-cards");
        nfBoosterFunImageElement.addEventListener("load", cardImageLoaded(nfBoosterFunImageElement, nfBoosterFunImagePrimary, nfBoosterFunStack));

        //  Insert Price
        const nfBoosterFunPriceElement = document.getElementById("boosterfun-nf-" + l + "-price");
        nfBoosterFunPriceElement.innerText = USDollar.format(nfBoosterFunPrice);

        //  Push price to price array
        myPrices.push(nfBoosterFunPrice);
    }
}

async function sourceMaterialPull_SPM() {
    // Random number between 0 and 100.5
    sourceMaterialRoll = getRandomNumber(0, 100.5);
    var sourceMaterialLink = "";

    // Override roll
    // sourceMaterialRoll = 97;

    if (sourceMaterialRoll <= 75) {
        // Foil full-art land
        sourceMaterialLink = "https://api.scryfall.com/cards/random?q=set%3Amar+date%3A2025-09-26&unique=cards";
        sourceMaterialType = "Source Material, Mythic";
        sourceMaterialRarity = "75%";
    } else {
        sourceMaterialLink = "https://api.scryfall.com/cards/random?q=set%3Amar+date%3A2025-09-26&unique=cards";
        sourceMaterialType = "Source Material, Mythic (Foil)";
        sourceMaterialRarity = "25%";
    }

    let response = await fetch(sourceMaterialLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    sourceMaterialName = card.name;
    window.cardInfo.sourcematerial = [sourceMaterialName, sourceMaterialType, sourceMaterialRarity];

    var sourceMaterialImageElement = document.getElementById("sourcematerial-image");

    // Add foil effect if foil
    if (sourceMaterialType.includes("Foil")) {
        sourceMaterialImageElement.previousElementSibling.classList.add("foil-gradient");
    } else {
        sourceMaterialImageElement.previousElementSibling.classList.remove("foil-gradient");
    }

    // Set price, foil price if foil
    if (!sourceMaterialType.includes("Foil")) {
        sourceMaterialPrice = Number(card.prices.usd * priceCut);
    } else {
        sourceMaterialPrice = Number(card.prices.usd_foil * priceCut);
    }

    //   Replace Img Source
    sourceMaterialImagePrimary = card.image_uris.normal;
    document.getElementById("sourcematerial-image").src = sourceMaterialImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const sourceMaterialStack = sourceMaterialImageElement.closest(".both-cards");
    sourceMaterialImageElement.addEventListener("load", cardImageLoaded(sourceMaterialImageElement, sourceMaterialImagePrimary, sourceMaterialStack));

    //  Insert Price
    const sourceMaterialPriceElement = document.getElementById("sourcematerial-price");
    sourceMaterialPriceElement.innerText = USDollar.format(sourceMaterialPrice);

    //  Insert Roll
    const sourceMaterialRollElement = document.getElementById("sourcematerial-roll");
    sourceMaterialRollElement.innerText = "N/A";

    //  Push price to price array
    myPrices.push(sourceMaterialPrice);
}

async function boosterFunPull_SPM() {
    // Random number between 0 and 100
    boosterFunRoll = getRandomNumber(0, 100);
    var boosterFunLink = "";

    // Override roll
    // boosterFunRoll = 99.9;

    if (boosterFunRoll <= 54) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D244+AND+CN<%3D283%29&unique=cards";
        boosterFunType = "Extended-art, Rare (Foil)";
        boosterFunRarity = "54%";
    } else if (boosterFunRoll <= 59.7) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D244+AND+CN<%3D283%29&unique=cards";
        boosterFunType = "Extended-art, Mythic (Foil)";
        boosterFunRarity = "5.7%";
    } else if (boosterFunRoll <= 69.5) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
        boosterFunType = "Web-slinger, Rare (Foil)";
        boosterFunRarity = "9.8%";
    } else if (boosterFunRoll <= 71.1) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
        boosterFunType = "Web-slinger, Mythic (Foil)";
        boosterFunRarity = "1.6%";
    } else if (boosterFunRoll <= 87.5) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
        boosterFunType = "Panel, Rare (Foil)";
        boosterFunRarity = "16.4%";
    } else if (boosterFunRoll <= 90.7) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
        boosterFunType = "Panel, Mythic (Foil)";
        boosterFunRarity = "3.2%";
    } else if (boosterFunRoll <= 95.6) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D199AND+CN<%3D207%29&unique=cards";
        boosterFunType = "Scene, Rare (Foil)";
        boosterFunRarity = "4.9%";
    } else if (boosterFunRoll <= 96.5) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D199AND+CN<%3D207%29&unique=cards";
        boosterFunType = "Scene, Mythic (Foil)";
        boosterFunRarity = "< 1%";
    } else if (boosterFunRoll <= 99) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D232AND+CN<%3D234%29&unique=cards";
        boosterFunType = "Classic Comic, Mythic (Foil)";
        boosterFunRarity = "2.5%";
    } else if (boosterFunRoll <= 99.8) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D235AND+CN<%3D241%29&unique=cards";
        boosterFunType = "Costume Change, Mythic (Foil)";
        boosterFunRarity = "< 1%";
    } else if (boosterFunRoll <= 99.975) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+CN=243&unique=cards";
        boosterFunType = "The Soul Stone, Gauntlet Version (Foil)";
        boosterFunRarity = "< 1% (roughly estimated at 0.175% here)";
    } else {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+CN=242&unique=cards";
        boosterFunType = "The Soul Stone, Headliner Version (Cosmic Foil)";
        boosterFunRarity = "*Extremely* rare (roughly estimated at 0.025% here)";
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
    if (card.layout == "transform" || card.layout == "modal_dfc") {
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

async function commonPull_SPMPlay() {
    commonSPGRoll = getRandomNumber(0, 100);
    // commonSPGRoll = 0.41;

    //  Get card from Scryfall
    for (i = 1; i <= 7; i++) {
        // set:fdn rarity:c (cn<=253 or cn=262)
        commonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN<181+OR+CN%3D188%29&unique=cards";

        // If source material hits...
        if (i === 7) {
            sourceRoll = getRandomInt(1, 24);
            if (sourceRoll === 1) {
                commonLink = "https://api.scryfall.com/cards/random?q=set%3Amar+date%3A2025-09-26&unique=cards";
            } else {
                commonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN<181+OR+CN%3D188%29&unique=cards";
            }
        }

        let response = await fetch(commonLink);
        let commonCard = await response.json();

        window.cardInfo.common = ["6-7 Main-set Commons", "In every 1 of 24 Play Boosters, a borderless source material card replaces one of these Commons."];

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

async function uncommonPull_SPMPlay() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j <= 3; j++) {
        uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au+unique%3Aart&unique=cards";

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

    window.cardInfo.uncommon = ["3 Main-set Uncommons", "3 Uncommon scene cards can also be found in these slots."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function landPull_SPMPlay() {
    // Random number between 0 and 100
    landRoll = getRandomNumber(0, 100);
    var landLink = "";

    // Override roll
    // landRoll = 99.1;

    if (landRoll <= 50) {
        // Foil full-art land
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN>%3D179+AND+CN<%3D187%29&unique=cards";
        landType = "Two-color land";
        landRarity = "50%";
    } else if (landRoll <= 75) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+type%3Abasic+is%3Afullart&unique=cards";
        landType = "Spiderweb basic land";
        landRarity = "25%";
    } else {
        landLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+type%3Abasic&unique=cards";
        landType = "Default frame basic land";
        landRarity = "25%";
    }

    // Roll for foil
    foilRoll = getRandomNumber(0, 100);
    if (foilRoll <= 20) {
        landType += " (Foil)";
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

async function rareMythicPull_SPMPlay() {
    // Random number between 0 and 100
    rareMythicRoll = getRandomNumber(0, 100);
    var rareMythicLink = "";

    // Override roll
    // rareMythicRoll = 99.1;

    if (rareMythicRoll <= 83.7) {
        // Foil full-art land
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar&unique=cards";
        rareMythicType = "Default frame, Rare";
        rareMythicRarity = "83.7%";
    } else if (rareMythicRoll <= 95.4) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am&unique=cards";
        rareMythicType = "Default frame, Mythic";
        rareMythicRarity = "11.7%";
    } else if (rareMythicRoll <= 96.6) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
        rareMythicType = "Web-slinger, Rare";
        rareMythicRarity = "1.2%";
    } else if (rareMythicRoll <= 96.7) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
        rareMythicType = "Web-slinger, Mythic";
        rareMythicRarity = "< 1%";
    } else if (rareMythicRoll <= 98.8) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
        rareMythicType = "Panel, Rare";
        rareMythicRarity = "2.1%";
    } else if (rareMythicRoll <= 98.9) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
        rareMythicType = "Panel, Mythic";
        rareMythicRarity = "< 1%";
    } else if (rareMythicRoll <= 99.9) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
        rareMythicType = "Scene, Rare";
        rareMythicRarity = "1%";
    } else {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
        rareMythicType = "Scene, Mythic";
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
    if (card.layout == "transform" || card.layout == "modal_dfc") {
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

async function nfWildcardPull_SPMPlay() {
    // Random number between 0 and 100
    nfWildcardRoll = getRandomNumber(0, 100);

    // Override roll
    // nfWildcardRoll = 94.9;

    if (nfWildcardRoll <= 65.8) {
        nfWildcardType = "Default frame, Common (Foil)";
        nfWildcardRarity = "65.8%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN<180+OR+CN%3D188%29&unique=cards";
    } else if (nfWildcardRoll <= 89.9) {
        nfWildcardType = "Default frame, Uncommon (Foil)";
        nfWildcardRarity = "24.1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au&unique=cards";
    } else if (nfWildcardRoll <= 97.7) {
        nfWildcardType = "Default frame, Rare (Foil)";
        nfWildcardRarity = "7.8%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar&unique=cards";
    } else if (nfWildcardRoll <= 98.8) {
        nfWildcardType = "Default frame, Mythic (Foil)";
        nfWildcardRarity = "1.1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am&unique=cards";
    } else if (nfWildcardRoll <= 98.95) {
        nfWildcardType = "Web-slinger, Rare (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
    } else if (nfWildcardRoll <= 99.15) {
        nfWildcardType = "Web-slinger, Mythic (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
    } else if (nfWildcardRoll <= 99.3) {
        nfWildcardType = "Panel, Rare (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
    } else if (nfWildcardRoll <= 99.5) {
        nfWildcardType = "Panel, Mythic (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
    } else if (nfWildcardRoll <= 99.65) {
        nfWildcardType = "Scene, Uncommon (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
    } else if (nfWildcardRoll <= 99.8) {
        nfWildcardType = "Scene, Rare (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
    } else {
        nfWildcardType = "Scene, Mythic (Foil)";
        nfWildcardRarity = "< 1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
    }

    let response = await fetch(nfWildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfWildcardName = card.name;
    window.cardInfo.nfwildcard = [nfWildcardName, nfWildcardType, nfWildcardRarity];
    nfWildcardPrice = convertCurrency(card.prices.usd * priceCut);

    if (card.layout == "transform" || card.layout == "modal_dfc") {
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

async function wildcardPull_SPMPlay() {
    // Random number between 0 and 100.1
    wildcardRoll = getRandomNumber(0, 100);

    // Override roll
    // wildcardRoll = 94.9;

    if (wildcardRoll <= 65.8) {
        wildcardType = "Default frame, Common (Foil)";
        wildcardRarity = "65.8%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ac+%28CN<180+OR+CN%3D188%29&unique=cards";
    } else if (wildcardRoll <= 89.9) {
        wildcardType = "Default frame, Uncommon (Foil)";
        wildcardRarity = "24.1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au&unique=cards";
    } else if (wildcardRoll <= 97.7) {
        wildcardType = "Default frame, Rare (Foil)";
        wildcardRarity = "7.8%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar&unique=cards";
    } else if (wildcardRoll <= 98.8) {
        wildcardType = "Default frame, Mythic (Foil)";
        wildcardRarity = "1.1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am&unique=cards";
    } else if (wildcardRoll <= 98.95) {
        wildcardType = "Web-slinger, Rare (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
    } else if (wildcardRoll <= 99.15) {
        wildcardType = "Web-slinger, Mythic (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D208+AND+CN<%3D217%29&unique=cards";
    } else if (wildcardRoll <= 99.3) {
        wildcardType = "Panel, Rare (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
    } else if (wildcardRoll <= 99.5) {
        wildcardType = "Panel, Mythic (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D218+AND+CN<%3D231%29&unique=cards";
    } else if (wildcardRoll <= 99.65) {
        wildcardType = "Scene, Uncommon (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Au+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
    } else if (wildcardRoll <= 99.8) {
        wildcardType = "Scene, Rare (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Ar+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
    } else {
        wildcardType = "Scene, Mythic (Foil)";
        wildcardRarity = "< 1%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Aspm+rarity%3Am+%28CN>%3D199+AND+CN<%3D207%29&unique=cards";
    }

    let response = await fetch(wildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    wildcardName = card.name;
    window.cardInfo.wildcard = [wildcardName, wildcardType, wildcardRarity];
    wildcardPrice = convertCurrency(card.prices.usd_foil * priceCut);

    wildcardImagePrimary = card.image_uris.normal;

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
