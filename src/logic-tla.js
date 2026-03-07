const ghostLinkHalf_TLA = "https://api.scryfall.com/cards/random?q=%28set%3Atla+or+set%3Atle%29+date%3A2025-11-21+unique%3Aprints+";
const topOutLink_TLA = "https://api.scryfall.com/cards/search?order=usd&q=%28set%3Atla+or+set%3Atle%29+date%3A2025-11-21+unique%3Aprints+USD%3E%3D15";
const boosterType_TLA = "Collector";

window.setName = "TLA";
window.TLA = {
    totalCards: 15,
    totalCards_PLAY: 14,
};
window.cardInfo = window.cardInfo || {};

function setTLA_Money() {
    if (getCookie("currentBoosterType") === "PLAY") {
        document.cookie = "currentBoosterType = PLAY";
        window.TLA = {
            totalCards: 14,
        };
        boosterValue = getCookie("boosterValue_TLA_PLAY") ? getCookie("boosterValue_TLA_PLAY") : 6;
        CAD_boosterValue = getCookie("boosterValue_CAD_TLA_PLAY") ? getCookie("boosterValue_CAD_TLA_PLAY") : 9;
        msrp = 6.99;

        makeTLAPlaySlots();

        document.cookie = "boosterValue_TLA_PLAY = " + boosterValue;
        document.cookie = "boosterValue_CAD_TLA_PLAY = " + CAD_boosterValue;
    } else {
        document.cookie = "currentBoosterType = COLLECTOR";
        window.TLA = {
            totalCards: 15,
        };
        boosterValue = getCookie("boosterValue_TLA") ? getCookie("boosterValue_TLA") : 42;
        CAD_boosterValue = getCookie("boosterValue_CAD_TLA") ? getCookie("boosterValue_CAD_TLA") : 60;
        msrp = 37.99;

        console.log("should be making TLA Collector slots");
        makeTLASlots();

        document.cookie = "boosterValue_TLA = " + boosterValue;
        document.cookie = "boosterValue_CAD_TLA = " + CAD_boosterValue;
    }
}

function setTLA() {
    currentSet = "TLA";
    document.cookie = "currentSet = TLA";
    window.boosterType = "both";

    boosterCheck("both");

    priceCutActive = true;
    priceCut = 1;

    document.getElementById("set-header").innerText = "AVATAR: THE LAST AIRBENDER";

    document.body.style.backgroundImage = "url(img/TLA_bg_dark.jpg)";

    clearSlots();
    setTLA_Money();

    clearMoney();
    changeSet();
}

function makeTLASlots() {
    makeSlot("boosterfun", "Foil Booster Fun", true);
    makeSlot("sourcematerial", "Source Material", true);
    makeSlot("boosterfunnf", "Booster Fun");
    makeSlot("raremythictle", "Foil TLE Rare or Mythic", true);
    makeSlot("raremythic", "Foil Rare or Mythic", true);
    makeSlot("land", "Foil Full-Art Basic Land", true);
    makeSlot("uncommontlebf", "Foil TLE/BF Uncommon", true);
    makeSlot("uncommon", "Foil Uncommons", true, 3);
    makeSlot("commonsup", "Foil TLE Commons", true, 2);
    makeSlot("common", "Foil Commons", true, 3);
}

function makeTLAPlaySlots() {
    makeSlot("wildcard", "Foil Wildcard", true);
    makeSlot("raremythic", "Rare or Mythic");
    makeSlot("nfwildcard", "Non-Foil Wildcard");
    makeSlot("land", "Land", true);
    makeSlot("uncommon", "Uncommons", false, 3);
    makeSlot("common", "Commons", false, 7);
}

function pullTLA() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_TLA();
        uncommonPull_TLA();
        commonPullTLE_TLA();
        uncommonPullTLEBF_TLA();
        landPull_TLA();
        rareMythicPull_TLA();
        rareMythicTLEPull_TLA();
        nfBoosterFunPull_TLA();
        sourceMaterialPull_TLA();
        boosterFunPull_TLA();

        sumTotals();
    } else {
        console.log("already working");
    }
}

function pullTLA_Play() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_TLAPlay();
        uncommonPull_TLAPlay();
        landPull_TLAPlay();
        nfWildcardPull_TLAPlay();
        rareMythicPull_TLAPlay();
        wildcardPull_TLAPlay();

        sumTotals();
    } else {
        console.log("already working");
    }
}

async function commonPull_TLA() {
    // Clear out all common card divs, if they exist
    commonSet = document.getElementById("common-sup-set");

    //  Get card from Scryfall
    for (k = 1; k < 4; k++) {
        // Random number between 0 and 100
        commonRoll = getRandomNumber(0, 100);
        var commonLink = "";

        commonLink = "https://api.scryfall.com/cards/random?q=set%3Atla+rarity%3Ac+%28CN>%3D1+AND+CN<%3D281%29+&unique=cards";
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

    window.cardInfo.common = ["5 Commons", "Main set (85.8%), Two-color land (7.1%), Welcome deck (7.1%)."];

    const commonSumElement = document.getElementById("common-sum");
    commonSumElement.innerText = commonSum;

    // Set Sum on page, clear value.
    commonSumElement.innerText = "$" + commonSum.toFixed(2);
}

async function uncommonPull_TLA() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j < 4; j++) {
        uncommonLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+%28CN>%3D1+AND+CN<%3D281%29+&unique=cards";
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

    window.cardInfo.uncommon = ["3 Uncommons", "Main set (87.3%), Welcome deck (7.9%), Scene (4.8%)."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function commonPullTLE_TLA() {
    // Clear out all common card divs, if they exist
    commonTLESet = document.getElementById("common-set-tle");

    //  Get card from Scryfall
    for (m = 1; m < 3; m++) {
        commonTLELink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Ac+&unique=cards";
        commonTLEType = "Main set, Common (Foil)";
        commonTLERarity = "100%";

        let response = await fetch(commonTLELink);
        let commonTLECard = await response.json();
        commonTLEName = commonTLECard.name;
        console.log(commonTLEName);

        //  Replace Img Source
        commonTLEImage = commonTLECard.image_uris.normal;

        var commonTLEImageId = "commonsup-image-" + m;
        commonTLEImageElement = document.getElementById(commonTLEImageId);
        commonTLEImageElement.src = commonTLEImage;

        //  When card has loaded...Flip and wait accordingly
        const commonTLEStack = document.getElementById("commonsup-image-" + m).parentElement;
        commonTLEImageElement.addEventListener("load", cardImageLoaded(commonTLEImageElement, commonTLEImage, commonTLEStack));

        commonTLEPrice = convertCurrency(commonTLECard.prices.usd_foil * priceCut);

        //  Create Common Sum Element
        commonTLESum = 4;

        //  Push price to price array
        myPrices.push(commonTLEPrice);
    }

    window.cardInfo.commonsup = ["2 TLE Commons", "From the Jumpstart or Beginner Box products."];

    const commonTLESumElement = document.getElementById("commonsup-sum");
    commonTLESumElement.innerText = commonTLESum;

    // Set Sum on page, clear value.
    commonTLESumElement.innerText = "$" + commonTLESum.toFixed(2);
}

async function uncommonPullTLEBF_TLA() {
    uncommonTLEBFRoll = getRandomNumber(0, 100);
    var uncommonTLEBFLink = "";

    // Override roll
    // uncommonTLEBFRoll = 99.1;

    if (uncommonTLEBFRoll <= 8) {
        // 4 Scene cards from Main set
        uncommonTLEBFLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+%28CN>%3D297+AND+CN<%3D315%29+&unique=cards";
        uncommonTLEBFType = "Scene, Uncommon (Foil)";
        uncommonTLEBFRarity = "8%";
    } else {
        uncommonTLEBFLink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Au+%28CN>%3D1+AND+CN<%3D304%29+&unique=cards";
        uncommonTLEBFType = "Jumpstart or Beginner Box (Foil)";
        uncommonTLEBFRarity = "92%";
    }

    let response = await fetch(uncommonTLEBFLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    uncommonTLEBFName = card.name;
    window.cardInfo.uncommontlebf = [uncommonTLEBFName, uncommonTLEBFType, uncommonTLEBFRarity];

    var uncommonTLEBFImageElement = document.getElementById("uncommontlebf-image").previousElementSibling;

    // Add foil effect if foil
    uncommonTLEBFImageElement.classList.add("foil-gradient");

    // Set price, foil price if foil
    uncommonTLEBFPrice = Number(card.prices.usd_foil * priceCut);

    //   Replace Img Source
    uncommonTLEBFImagePrimary = card.image_uris.normal;
    document.getElementById("uncommontlebf-image").src = uncommonTLEBFImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const uncommonTLEBFStack = uncommonTLEBFImageElement.closest(".both-cards");
    uncommonTLEBFImageElement.addEventListener("load", cardImageLoaded(uncommonTLEBFImageElement, uncommonTLEBFImagePrimary, uncommonTLEBFStack));

    //  Insert Price
    const uncommonTLEBFPriceElement = document.getElementById("uncommontlebf-price");
    uncommonTLEBFPriceElement.innerText = USDollar.format(uncommonTLEBFPrice);

    //  Insert Roll
    const uncommonTLEBFRollElement = document.getElementById("uncommontlebf-roll");
    uncommonTLEBFRollElement.innerText = "N/A";

    //  Push price to price array
    myPrices.push(uncommonTLEBFPrice);
}

async function landPull_TLA() {
    landRoll = getRandomNumber(0, 100);
    var landLink = "";

    // Override roll
    // landRoll = 99.1;

    if (landRoll <= 50) {
        // Foil full-art land
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+type%3Abasic+%28CN>%3D287+AND+CN<%3D291%29";
        landType = "Full-art Appa basic land (Foil)";
        landRarity = "50%";
    } else {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+type%3Abasic+%28CN>%3D292+AND+CN<%3D296%29";
        landType = "Full-art Avatar's Journey basic land (Foil)";
        landRarity = "25%";
    }

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

async function rareMythicPull_TLA() {
    // Random number between 0 and 100
    rareMythicRoll = getRandomNumber(0, 100);
    var rareMythicLink = "";

    // Override roll
    // rareMythicRoll = 99.1;

    if (rareMythicRoll <= 85.7) {
        // Foil full-art land
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D1+AND+CN<%3D281%29+&unique=cards";
        rareMythicType = "Default frame, Rare (Foil)";
        rareMythicRarity = "85.7%";
    } else {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D1+AND+CN<%3D281%29+&unique=cards";
        rareMythicType = "Default frame, Mythic (Foil)";
        rareMythicRarity = "14.3%";
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

async function rareMythicTLEPull_TLA() {
    // Random number between 0 and 100
    rareMythicTLERoll = getRandomNumber(0, 100);
    var rareMythicTLELink = "";

    // Override roll
    // rareTLEMythicRoll = 99.1;

    if (rareMythicTLERoll <= 37) {
        // Foil full-art land
        rareMythicTLELink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Ar+%28CN>%3D74+AND+CN<%3D170%29&unique=cards";
        rareMythicTLEType = "Jumpstart, Rare (Foil)";
        rareMythicTLERarity = "37%";
    } else if (rareMythicTLERoll <= 43.4) {
        rareMythicTLELink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Am+%28CN>%3D74+AND+CN<%3D170%29&unique=cards";
        rareMythicTLEType = "Jumpstart, Mythic (Foil)";
        rareMythicTLERarity = "6.4%";
    } else if (rareMythicTLERoll <= 54.9) {
        rareMythicTLELink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Ar+%28CN>%3D210+AND+CN<%3D304%29&unique=cards";
        rareMythicTLEType = "Beginner Box, Rare (Foil)";
        rareMythicTLERarity = "11.5%";
    } else if (rareMythicTLERoll <= 87.3) {
        rareMythicTLELink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Ar+%28CN>%3D171+AND+CN<%3D209%29&unique=cards";
        rareMythicTLEType = "Jumpstart Extended-art, Rare (Foil)";
        rareMythicTLERarity = "32.4%";
    } else {
        rareMythicTLELink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Am+%28CN>%3D171+AND+CN<%3D209%29&unique=cards";
        rareMythicTLEType = "Jumpstart Extended-art, Mythic (Foil)";
        rareMythicTLERarity = "12.7%";
    }

    let response = await fetch(rareMythicTLELink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    rareMythicTLEName = card.name;
    window.cardInfo.raremythictle = [rareMythicTLEName, rareMythicTLEType, rareMythicTLERarity];

    var rareMythicTLEImageElement = document.getElementById("raremythictle-image").previousElementSibling;

    rareMythicTLEImageElement.classList.add("foil-gradient");

    // Set price, foil price if foil
    rareMythicTLEPrice = Number(card.prices.usd_foil * priceCut);

    //   Replace Img Source, check for DFC
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        rareMythicTLEImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        rareMythicTLEImagePrimary = card.image_uris.normal;
    }
    document.getElementById("raremythictle-image").src = rareMythicTLEImagePrimary;

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const rareMythicTLEStack = rareMythicTLEImageElement.closest(".both-cards");
    rareMythicTLEImageElement.addEventListener("load", cardImageLoaded(rareMythicTLEImageElement, rareMythicTLEImagePrimary, rareMythicTLEStack));

    //  Insert Price
    const rareMythicTLEPriceElement = document.getElementById("raremythictle-price");
    rareMythicTLEPriceElement.innerText = USDollar.format(rareMythicTLEPrice);

    //  Push price to price array
    myPrices.push(rareMythicTLEPrice);
}

async function nfBoosterFunPull_TLA() {
    // Random number between 0 and 100
    nfBoosterFunRoll = getRandomNumber(0, 100);
    var nfBoosterFunLink = "";

    // Override roll
    // nfBoosterFunRoll = 94.9;

    if (nfBoosterFunRoll <= 7.8) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D297+AND+CN<%3D315%29&unique=cardss";
        nfBoosterFunType = "Scene, Rare";
        nfBoosterFunRarity = "7.8%";
    } else if (nfBoosterFunRoll <= 8.9) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D297+AND+CN<%3D315%29&unique=cards";
        nfBoosterFunType = "Scene, Mythic";
        nfBoosterFunRarity = "1.1%";
    } else if (nfBoosterFunRoll <= 15.8) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D316+AND+CN<%3D330%29&unique=cards";
        nfBoosterFunType = "Field notes, Rare";
        nfBoosterFunRarity = "6.9%";
    } else if (nfBoosterFunRoll <= 18.8) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D316+AND+CN<%3D330%29&unique=cards";
        nfBoosterFunType = "Field notes, Mythic";
        nfBoosterFunRarity = "3%";
    } else if (nfBoosterFunRoll <= 20.1) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D331+AND+CN<%3D335%29&unique=cards";
        nfBoosterFunType = "Battle pose, Rare";
        nfBoosterFunRarity = "1.3%";
    } else if (nfBoosterFunRoll <= 20.75) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D331+AND+CN<%3D335%29&unique=cards";
        nfBoosterFunType = "Battle pose, Mythic";
        nfBoosterFunRarity = "< 1% (roughly estimated at .65%)";
    } else if (nfBoosterFunRoll <= 32.45) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D336+AND+CN<%3D353%29&unique=cards";
        nfBoosterFunType = "Elemental frame, Rare";
        nfBoosterFunRarity = "11.%";
    } else if (nfBoosterFunRoll <= 33.55) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D336+AND+CN<%3D353%29&unique=cards";
        nfBoosterFunType = "Elemental frame, Mythic";
        nfBoosterFunRarity = "1.1%";
    } else if (nfBoosterFunRoll <= 35.75) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D354+AND+CN<%3D358%29&unique=cards";
        nfBoosterFunType = "Double-faced Saga, Mythic";
        nfBoosterFunRarity = "2.2%";
    } else if (nfBoosterFunRoll <= 59.95) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D364+AND+CN<%3D392%29&unique=cards";
        nfBoosterFunType = "Extended-art, Rare";
        nfBoosterFunRarity = "24.2%";
    } else if (nfBoosterFunRoll <= 60.6) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D364+AND+CN<%3D392%29&unique=cards";
        nfBoosterFunType = "Extended-art, Mythic";
        nfBoosterFunRarity = "< 1% (roughly estimated at .65%)";
    } else if (nfBoosterFunRoll <= 84.8) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Ar+%28CN>%3D171+and+CN<%3D209%29&unique=cards&as=grid&order=name";
        nfBoosterFunType = "Jumpstart Extended-art, Rare";
        nfBoosterFunRarity = "24.2%";
    } else if (nfBoosterFunRoll <= 89.6) {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLE+rarity%3Am+%28CN>%3D171+and+CN<%3D209%29&unique=cards";
        nfBoosterFunType = "Jumpstart Extended-art, Mythic";
        nfBoosterFunRarity = "4.8%";
    } else {
        nfBoosterFunLink = "https://api.scryfall.com/cards/random?q=set%3Atle+rarity%3Ar+%28CN>%3D62+and+CN<%3D73%29&unique=cards";
        nfBoosterFunType = "Scene Box, Rare";
        nfBoosterFunRarity = "10.4%";
    }

    let response = await fetch(nfBoosterFunLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfBoosterFunName = card.name;
    window.cardInfo[`boosterfunnf`] = [nfBoosterFunName, nfBoosterFunType, nfBoosterFunRarity];
    nfBoosterFunPrice = convertCurrency(card.prices.usd * priceCut);

    // TO FIX: figure out if DFC....
    if (card.layout == "transform" || card.layout == "modal_dfc") {
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

async function sourceMaterialPull_TLA() {
    // Random number between 0 and 100.5
    sourceMaterialRoll = getRandomNumber(0, 100.5);
    var sourceMaterialLink = "";

    // Override roll
    // sourceMaterialRoll = 97;

    if (sourceMaterialRoll <= 75) {
        // Foil full-art land
        sourceMaterialLink = "https://api.scryfall.com/cards/random?q=set%3ATLE+%28CN>%3D1+AND+CN<%3D61%29&unique=cards";
        sourceMaterialType = "Source Material, Mythic";
        sourceMaterialRarity = "75%";
    } else {
        sourceMaterialLink = "https://api.scryfall.com/cards/random?q=set%3ATLE+%28CN>%3D1+AND+CN<%3D61%29&unique=cards";
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

async function boosterFunPull_TLA() {
    // Random number between 0 and 100
    boosterFunRoll = getRandomNumber(0, 100);
    var boosterFunLink = "";

    // Override roll
    // boosterFunRoll = 34.6;

    if (boosterFunRoll <= 12.8) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D297+AND+CN<%3D315%29&unique=cards";
        boosterFunType = "Scene, Rare (Foil)";
        boosterFunRarity = "12.8%";
    } else if (boosterFunRoll <= 14.6) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D297+AND+CN<%3D315%29&unique=cards";
        boosterFunType = "Scene, Mythic (Foil)";
        boosterFunRarity = "1.8%";
    } else if (boosterFunRoll <= 26) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D316+AND+CN<%3D330%29&unique=cards";
        boosterFunType = "Field notes, Rare (Foil)";
        boosterFunRarity = "11.4%";
    } else if (boosterFunRoll <= 31) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D316+AND+CN<%3D330%29&unique=cards";
        boosterFunType = "Field notes, Mythic (Foil)";
        boosterFunRarity = "5%";
    } else if (boosterFunRoll <= 33.1) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D331+AND+CN<%3D335%29&unique=cards";
        boosterFunType = "Battle pose, Rare (Foil)";
        boosterFunRarity = "2.1%";
    } else if (boosterFunRoll <= 34.5) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D331+AND+CN<%3D335%29&unique=cards";
        boosterFunType = "Battle pose, Mythic (Foil)";
        boosterFunRarity = "1.4%";
    } else if (boosterFunRoll <= 34.95) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D359+AND+CN<%3D362%29&unique=cards";
        boosterFunType = "Neon ink battle pose, Rare (Foil)";
        boosterFunRarity = "< 1% (roughly estimated at .45%)";
    } else if (boosterFunRoll <= 54.15) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D336+AND+CN<%3D353%29&unique=cards";
        boosterFunType = "Elemental frame, Rare (Foil)";
        boosterFunRarity = "19.2%";
    } else if (boosterFunRoll <= 55.95) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D336+AND+CN<%3D353%29&unique=cards";
        boosterFunType = "Elemental frame, Mythic (Foil)";
        boosterFunRarity = "1.8%";
    } else if (boosterFunRoll <= 59.55) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D354+AND+CN<%3D358%29&unique=cards";
        boosterFunType = "Double-faced Saga, Mythic (Foil)";
        boosterFunRarity = "3.6%";
    } else if (boosterFunRoll <= 99.45) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D364+AND+CN<%3D392%29&unique=cards";
        boosterFunType = "Extended art, Rare (Foil)";
        boosterFunRarity = "39.9%";
    } else if (boosterFunRoll <= 99.9) {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D364+AND+CN<%3D392%29&unique=cards";
        boosterFunType = "Extended-art, Mythic (Foil)";
        boosterFunRarity = "< 1% (roughly estimated at .45%)";
    } else {
        boosterFunLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+CN%3D363&unique=cards";
        boosterFunType = "Raised foil Avatar Aang (Foil)";
        boosterFunRarity = "Extremely rare (roughly estimated at 0.1%)";
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

async function commonPull_TLAPlay() {
    for (i = 1; i <= 7; i++) {
        commonLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3AC+%28CN<262+OR+CN%3D277%29&unique=cards";

        // If source material hits...
        if (i === 7) {
            sourceRoll = getRandomInt(1, 26);
            if (sourceRoll === 1) {
                commonLink = "https://api.scryfall.com/cards/random?q=set%3ATLE++%28CN>%3D1+AND+CN<%3D61%29&unique=cards";
            } else {
                commonLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3AC+%28CN<262+OR+CN%3D277%29&unique=cards";
            }
        }

        let response = await fetch(commonLink);
        let commonCard = await response.json();

        window.cardInfo.common = ["6-7 Main-set Commons", "In every 1 of 26 Play Boosters, a borderless source material card replaces one of these Commons."];

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

async function uncommonPull_TLAPlay() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j <= 3; j++) {
        uncommonRoll = getRandomNumber(0, 100);
        var uncommonLink = "";

        // Override roll
        // uncommonRoll = 2;

        if (uncommonRoll <= 3.6) {
            // 4 Scene cards from Main set
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+CN>297&unique=cards";
            uncommonType = "Scene, Uncommon";
            uncommonRarity = "3.6%";
        } else {
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+CN<297&unique=cards";
            uncommonType = "Uncommon";
            uncommonRarity = "96.4%";
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

    window.cardInfo.uncommon = ["3 Main-set Uncommons", "4 Uncommon scene cards can also be found in these slots (3.6% chance)."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function landPull_TLAPlay() {
    // Random number between 0 and 100
    landRoll = getRandomNumber(0, 100);
    var landLink = "";

    // Override roll
    // landRoll = 99.1;

    if (landRoll <= 40) {
        // Foil full-art land
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D265+AND+CN<%3D281%29+ci%3D2&unique=cards";
        landType = "Common dual-land";
        landRarity = "40%";
    } else if (landRoll <= 60) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D282+AND+CN<%3D286%29&unique=cards";
        landType = "Default frame basic land";
        landRarity = "20%";
    } else if (landRoll <= 70) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D292+AND+CN<%3D296%29&unique=cards";
        landType = "Avatar's Journey full-art basic land";
        landRarity = "10%";
    } else if (landRoll <= 80) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D287+AND+CN<%3D291%29&unique=cards";
        landType = "Appa full-art basic land";
        landRarity = "10%";
    } else if (landRoll <= 90) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D265+AND+CN<%3D281%29+ci%3D2&unique=cards";
        landType = "Common dual-land (Foil)";
        landRarity = "10%";
    } else if (landRoll <= 95) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D282+AND+CN<%3D286%29&unique=cards";
        landType = "Default frame basic land (Foil)";
        landRarity = "5%";
    } else if (landRoll <= 97.5) {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D292+AND+CN<%3D296%29&unique=cards";
        landType = "Avatar's Journey full-art basic land (Foil)";
        landRarity = "2.5%";
    } else {
        landLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D287+AND+CN<%3D291%29&unique=cards";
        landType = "Appa full-art basic land (Foil)";
        landRarity = "2.5%";
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

async function rareMythicPull_TLAPlay() {
    // Random number between 0 and 100
    rareMythicRoll = getRandomNumber(0, 100);
    var rareMythicLink = "";

    // Override roll
    // rareMythicRoll = 99.1;

    if (rareMythicRoll <= 80) {
        // Foil full-art land
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D1+AND+CN<%3D296%29&order=cmc&as=grid&unique=cards";
        rareMythicType = "Default frame, Rare";
        rareMythicRarity = "80%";
    } else if (rareMythicRoll <= 92.6) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D1+AND+CN<%3D296%29&order=cmc&as=grid&unique=cards";
        rareMythicType = "Default frame, Mythic";
        rareMythicRarity = "12.6%";
    } else if (rareMythicRoll <= 94.2) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D297+AND+CN<%3D315%29&unique=cards";
        rareMythicType = "Scene, Rare";
        rareMythicRarity = "1.6%";
    } else if (rareMythicRoll <= 94.55) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D297+AND+CN<%3D315%29&unique=cards";
        rareMythicType = "Scene, Mythic";
        rareMythicRarity = "< 1% (roughly estimated at .35%)";
    } else if (rareMythicRoll <= 95.95) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D316+AND+CN<%3D330%29&unique=cards";
        rareMythicType = "Field Notes, Rare";
        rareMythicRarity = "1.4%";
    } else if (rareMythicRoll <= 96.3) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D316+AND+CN<%3D330%29&unique=cards";
        rareMythicType = "Field Notes, Mythic";
        rareMythicRarity = "< 1% (roughly estimated at .35%)";
    } else if (rareMythicRoll <= 96.65) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D331+AND+CN<%3D335%29&unique=cards";
        rareMythicType = "Battle Pose, Rare or Mythic";
        rareMythicRarity = "< 1% (roughly estimated at .35%)";
    } else if (rareMythicRoll <= 99.05) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN>%3D336+AND+CN<%3D353%29&unique=cards";
        rareMythicType = "Elemental frame, Rare";
        rareMythicRarity = "2.4%";
    } else if (rareMythicRoll <= 99.65) {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D336+AND+CN<%3D353%29&unique=cards";
        rareMythicType = "Elemental frame, Mythic";
        rareMythicRarity = "< 1% (roughly estimated at .6%)";
    } else {
        rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN>%3D354+AND+CN<%3D358%29&unique=cards";
        rareMythicType = "Double-faced Saga, Mythic";
        rareMythicRarity = "< 1% (roughly estimated at .35%)";
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

async function nfWildcardPull_TLAPlay() {
    // Random number between 0 and 100
    nfWildcardRoll = getRandomNumber(0, 100);

    // Override roll
    // nfWildcardRoll = 94.9;

    if (nfWildcardRoll <= 4.2) {
        nfWildcardType = "Default frame, Common";
        nfWildcardRarity = "4.2%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ac+%28CN<%3D262+OR+CN%3D277%29+&unique=cards";
    } else if (nfWildcardRoll <= 78.3) {
        nfWildcardType = "Default frame, Uncommon";
        nfWildcardRarity = "74.1%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+%28CN<%3D296%29+&unique=cards";
    } else if (nfWildcardRoll <= 95) {
        nfWildcardType = "Default frame, Rare";
        nfWildcardRarity = "16.7%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN<%3D296%29+&unique=cards";
    } else if (nfWildcardRoll <= 97.6) {
        nfWildcardType = "Default frame, Mythic";
        nfWildcardRarity = "2.6%";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN<%3D296%29+&unique=cards";
    } else if (nfWildcardRoll <= 98.35) {
        nfWildcardType = "Scene, Uncommon";
        nfWildcardRarity = "< 1% (roughly estimated at .75%)";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+%28CN>%3D297+AND+CN<%3D315%29+&unique=cards";
    } else if (nfWildcardRoll <= 98.68) {
        nfWildcardType = "Scene, Rare or Mythic";
        nfWildcardRarity = "< 1% (roughly estimated at .33%)";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28rarity%3Ar+or+rarity%3Am%29+%28CN>%3D297+AND+CN<%3D315%29+&unique=cards";
    } else if (nfWildcardRoll <= 99.01) {
        nfWildcardType = "Field Notes, Rare or Mythic";
        nfWildcardRarity = "< 1% (roughly estimated at .33%)";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28rarity%3Ar+or+rarity%3Am%29+%28CN>%3D316+AND+CN<%3D330%29+&unique=cards";
    } else if (nfWildcardRoll <= 99.34) {
        nfWildcardType = "Battle Pose, Rare or Mythic";
        nfWildcardRarity = "< 1% (roughly estimated at .33%)";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D331+AND+CN<%3D335%29+&unique=cards";
    } else if (nfWildcardRoll <= 99.67) {
        nfWildcardType = "Elemental frame, Rare or Mythic";
        nfWildcardRarity = "< 1% (roughly estimated at .33%)";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D336+AND+CN<%3D353%29+&unique=cards";
    } else {
        nfWildcardType = "Borderless double-faced Saga, Mythic";
        nfWildcardRarity = "< 1% (roughly estimated at .33%)";
        nfWildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D354+AND+CN<%3D358%29+&unique=cards";
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

async function wildcardPull_TLAPlay() {
    // Random number between 0 and 100.1
    wildcardRoll = getRandomNumber(0, 100);

    // Override roll
    // wildcardRoll = 94.9;

    if (wildcardRoll <= 53.9) {
        wildcardType = "Default frame, Common (Foil)";
        wildcardRarity = "53.9%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ac+%28CN<%3D262+OR+CN%3D277%29+&unique=cards";
    } else if (wildcardRoll <= 90.6) {
        wildcardType = "Default frame, Uncommon (Foil)";
        wildcardRarity = "36.7%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+%28CN<%3D296%29+&unique=cards";
    } else if (wildcardRoll <= 97.3) {
        wildcardType = "Default frame, Rare (Foil)";
        wildcardRarity = "6.7%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Ar+%28CN<%3D296%29+&unique=cards";
    } else if (wildcardRoll <= 98.5) {
        wildcardType = "Default frame, Mythic (Foil)";
        wildcardRarity = "1.2%";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Am+%28CN<%3D296%29+&unique=cards";
    } else if (wildcardRoll <= 98.75) {
        wildcardType = "Scene, Uncommon (Foil)";
        wildcardRarity = "< 1% (roughly estimated at .25%)";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+rarity%3Au+%28CN>%3D297+AND+CN<%3D315%29+&unique=cards";
    } else if (wildcardRoll <= 99) {
        wildcardType = "Scene, Rare or Mythic (Foil)";
        wildcardRarity = "< 1% (roughly estimated at .25%)";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28rarity%3Ar+or+rarity%3Am%29+%28CN>%3D297+AND+CN<%3D315%29+&unique=cards";
    } else if (wildcardRoll <= 99.25) {
        wildcardType = "Field Notes, Rare or Mythic (Foil)";
        wildcardRarity = "< 1% (roughly estimated at .25%)";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28rarity%3Ar+or+rarity%3Am%29+%28CN>%3D316+AND+CN<%3D330%29+&unique=cards";
    } else if (wildcardRoll <= 99.5) {
        wildcardType = "Battle Pose, Rare or Mythic (Foil)";
        wildcardRarity = "< 1% (roughly estimated at .25%)";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D331+AND+CN<%3D335%29+&unique=cards";
    } else if (wildcardRoll <= 99.75) {
        wildcardType = "Elemental frame, Rare or Mythic (Foil)";
        wildcardRarity = "< 1% (roughly estimated at .25%)";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D336+AND+CN<%3D353%29+&unique=cards";
    } else {
        wildcardType = "Borderless double-faced Saga, Mythic (Foil)";
        wildcardRarity = "< 1% (roughly estimated at .25%)";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3ATLA+%28CN>%3D354+AND+CN<%3D358%29+&unique=cards";
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
