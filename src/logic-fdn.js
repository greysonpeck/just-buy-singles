const ghostLinkHalf_FDN = "https://api.scryfall.com/cards/random?q=set%3Afdn+unique%3Aprints+";
const topOutLink_FDN = "https://api.scryfall.com/cards/search?order=usd&q=set%3Afdn+unique%3Aprints+USD%3E%3D15";

window.setName = "FDN";

window.cardInfo = window.cardInfo || {};

function setFDN_Money() {
    if (getCookie("currentBoosterType") === "PLAY") {
        //Nothing yet...
    } else {
        document.cookie = "currentBoosterType = COLLECTOR";
        window.FDN = {
            totalCards: 15,
        };
        boosterValue = getCookie("boosterValue_FDN") ? getCookie("boosterValue_FDN") : 40;
        CAD_boosterValue = getCookie("boosterValue_CAD_FDN") ? getCookie("boosterValue_CAD_FDN") : 60;
        msrp = 24.99;

        makeFDNSlots();

        document.cookie = "boosterValue_FDN = " + boosterValue;
        document.cookie = "boosterValue_CAD_FDN = " + CAD_boosterValue;
    }
}

function setFDN() {
    document.cookie = "currentBoosterType = COLLECTOR";

    currentSet = "FDN";
    document.cookie = "currentSet = FDN";
    window.boosterType = "COLLECTOR";

    boosterCheck("collector");

    priceCutActive = true;
    priceCut = 1;

    document.getElementById("set-header").innerText = "FOUNDATIONS";

    document.body.style.backgroundImage = "url(img/FDN_bg.png)";
    clearSlots();

    setFDN_Money();

    clearMoney();
    changeSet();
}

function makeFDNSlots() {
    makeSlot("foil", "Foil Wildcard", true);
    makeSlot("raremythic-1", "Foil Rare/Mythic #1", true);
    makeSlot("raremythic-2", "Foil Rare/Mythic #2", true);
    makeSlot("raremythic-nf-1", "Rare/Mythic #1");
    makeSlot("raremythic-nf-2", "Rare/Mythic #2");
    makeSlot("land", "Full-Art Basic Land", true);
    makeSlot("uncommon", "Foil Uncommons", true, 4);
    makeSlot("common", "Foil Commons", true, 5);
}

function pullFDN() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        commonPull_FDN();

        uncommonPull_FDN();

        rareMythic_FDN();

        nfRareMythic_FDN();

        landPull_FDN();

        foilPull_FDN();

        sumTotals();
    } else {
        console.log("already working");
    }
}

async function commonPull_FDN() {
    //  Get card from Scryfall
    for (i = 1; i < 6; i++) {
        //Common roll
        commonRoll = getRandomNumber(0, 100);

        if (commonRoll <= 87) {
            // set:fdn rarity:c (cn<=253 or cn=262)
            commonType = "Main Set Common";
            commonRarity = "87%";
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ac+%28cn<%3D253+or+cn%3D262%29";
        } else if (commonRoll <= 97.9) {
            // set:fdn rarity:c cn>=258 AND cn<=271 AND cn!=262
            commonType = "Common Dual Lands";
            commonRarity = "10.9%";
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ac+cn>%3D258+AND+cn<%3D271+AND+cn%21%3D262";
        } else {
            // set:fdn rarity:c border:borderless
            commonType = "Common Borderless";
            commonRarity = "2.1%";
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ac+border%3Aborderless";
        }

        let response = await fetch(commonLink);
        let commonCard = await response.json();

        window.cardInfo.common = ["5 Main-set commons", "10 common dual-lands appear 10.9% of the time, 2 borderless commons appear 2.1% of the time."];

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

        var commonPrice = convertCurrency(commonCard.prices.usd_foil * priceCut);

        //  Create Common Sum Element
        commonSum = commonSum + commonPrice;

        //  Push price to price array
        myPrices.push(commonPrice);

        const commonSumElement = document.getElementById("common-sum");
        commonSumElement.innerText = commonSum;

        // Set Sum on page, clear value.
        commonSumElement.innerText = "$" + commonSum.toFixed(2);
        // commonSum = 0;
    }
}

async function uncommonPull_FDN() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (j = 1; j < 5; j++) {
        // Uncommon roll
        uncommonRoll = getRandomNumber(0, 100);

        if (uncommonRoll <= 7.3) {
            // set:fdn rarity:u is:borderless
            uncommonType = "Borderless, Uncommon (Foil)";
            uncommonRarity = "7.3%";
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Au+is%3Aborderless";
        } else {
            uncommonType = "Default frame, Uncommon (Foil)";
            uncommonRarity = "92.7%";
            uncommonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Au+is%3Abooster";
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

    window.cardInfo.uncommon = ["3 Main-set Uncommons", "8 borderless uncommons appear 7.3% of the time."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function rareMythic_FDN() {
    for (k = 1; k < 3; k++) {
        // Random number between 0 and 100
        rareMythicRoll = getRandomNumber(0, 100);
        var rareMythicLink = "";

        // Override roll
        // rareRoll = 94.9;

        if (rareMythicRoll <= 85.7) {
            // set:fdn is:booster rarity:r
            rareMythicType = "Default frame, Rare (Foil)";
            rareMythicRarity = "85.7%";
            rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Abooster+rarity%3Ar";
        } else {
            // set:fdn is:booster rarity:m
            rareMythicType = "Default frame, Mythic (Foil)";
            rareMythicRarity = "14.3%";
            rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Abooster+rarity%3Am";
        }

        let response = await fetch(rareMythicLink);

        // waits until Scryfall fetch completes...
        let card = await response.json();
        rareMythicName = card.name;
        window.cardInfo[`raremythic-${k}`] = [rareMythicName, rareMythicType, rareMythicRarity];
        rareMythicPrice = convertCurrency(card.prices.usd_foil * priceCut);

        // TO FIX: figure out if DFC....
        rareMythicImagePrimary = card.image_uris.normal;

        //   Replace Img Source
        var rareMythicImageId = "raremythic-" + k + "-image";
        document.getElementById(rareMythicImageId).src = rareMythicImagePrimary;
        rareMythicImageElement = document.getElementById(rareMythicImageId);
        rareMythicImageElement.src = rareMythicImagePrimary;

        //  When card has loaded...Flip and wait accordingly
        let rareMythicStack = document.getElementById("raremythic-" + k + "-image").closest(".both-cards");
        rareMythicImageElement.addEventListener("load", cardImageLoaded(rareMythicImageElement, rareMythicImagePrimary, rareMythicStack));

        //  Add foil effect
        // var rareMythicCard = document.getElementById("raremythic-" + k + "-card");
        // rareMythicCard.firstElementChild.classList.add("foil-gradient");

        //  Insert Price
        const rarePriceElement = document.getElementById("raremythic-" + k + "-price");
        rarePriceElement.innerText = USDollar.format(rareMythicPrice);

        //  Insert Roll
        const rareMythicRollElement = document.getElementById("raremythic-" + k + "-roll");
        rareMythicRollElement.innerText = "Roll: " + rareMythicRoll.toFixed(0);

        //  Push price to price array
        myPrices.push(rareMythicPrice);
    }
}

async function nfRareMythic_FDN() {
    for (l = 1; l < 3; l++) {
        // Random number between 0 and 100
        nfRareMythicRoll = getRandomNumber(0, 100);
        var nfRareMythicLink = "";

        // Override roll
        // nfRareMythicRoll = 94.9;

        if (nfRareMythicRoll <= 46.2) {
            // set:fdn rarity:r is:borderless
            nfRareMythicType = "Borderless, Rare";
            nfRareMythicRarity = "46.2%";
            nfRareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ar+is%3Aborderless";
        } else if (nfRareMythicRoll <= 55.4) {
            // set:fdn is:borderless rarity:m
            nfRareMythicType = "Borderless, Mythic";
            nfRareMythicRarity = "9.2%";
            nfRareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Aborderless+rarity%3Am";
        } else if (nfRareMythicRoll <= 95.2) {
            // set:fdn rarity:r is:extendedart -CN:729
            nfRareMythicType = "Extended-art, Rare";
            nfRareMythicRarity = "39.8%";
            nfRareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ar+is%3Aextendedart+-CN%3A729";
        } else {
            nfRareMythicType = "Extended-art, Mythic";
            nfRareMythicRarity = "4.8%";
            nfRareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Am+is%3Aextendedart";
        }

        let response = await fetch(nfRareMythicLink);

        // waits until Scryfall fetch completes...
        let card = await response.json();
        nfRareMythicName = card.name;
        window.cardInfo[`raremythic-nf-${l}`] = [nfRareMythicName, nfRareMythicType, nfRareMythicRarity];
        nfRareMythicPrice = convertCurrency(card.prices.usd * priceCut);

        // TO FIX: figure out if DFC....
        nfRareMythicImagePrimary = card.image_uris.normal;

        //   Replace Img Source
        var nfRareMythicImageId = "raremythic-nf-" + l + "-image";
        document.getElementById(nfRareMythicImageId).src = nfRareMythicImagePrimary;
        nfRareMythicImageElement = document.getElementById(nfRareMythicImageId);
        nfRareMythicImageElement.src = nfRareMythicImagePrimary;

        //  When card has loaded...Flip and wait accordingly
        let nfRareMythicStack = document.getElementById("raremythic-nf-" + l + "-image").closest(".both-cards");
        nfRareMythicImageElement.addEventListener("load", cardImageLoaded(nfRareMythicImageElement, nfRareMythicImagePrimary, nfRareMythicStack));

        //  Insert Price
        const nfRarePriceElement = document.getElementById("raremythic-nf-" + l + "-price");
        nfRarePriceElement.innerText = USDollar.format(nfRareMythicPrice);

        //  Insert Roll
        const nfRareMythicRollElement = document.getElementById("raremythic-nf-" + l + "-roll");
        nfRareMythicRollElement.innerText = "Roll: " + nfRareMythicRoll.toFixed(0);

        //  Push price to price array
        myPrices.push(nfRareMythicPrice);
    }
}

async function foilPull_FDN() {
    // Random number between 0 and 100
    foilRoll = getRandomNumber(0, 100);
    var foilLink = "";

    // Override roll
    // foilRoll = 99.1;

    if (foilRoll <= 34.5) {
        // set:fdn rarity:r is:borderless
        foilType = "Borderless, Rare (Foil)";
        foilRarity = "34.5%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ar+is%3Aborderless";
    } else if (foilRoll <= 41.3) {
        foilType = "Borderless, Mythic (Foil)";
        foilRarity = "6.8%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Am+is%3Aborderless";
    } else if (foilRoll <= 70.9) {
        foilType = "Extended-art, Rare (Foil)";
        foilRarity = "29.6%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ar+is%3Aextendedart+-CN%3A729";
    } else if (foilRoll <= 74.5) {
        foilType = "Extended-art, Mythic (Foil)";
        foilRarity = "3.6%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Am+is%3Aextendedart+-CN%3A729";
    } else if (foilRoll <= 82.9) {
        foilType = "Mana-foil, Rare";
        foilRarity = "8.4%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ar+is%3Amanafoil";
    } else if (foilRoll <= 84.5) {
        foilType = "Mana-foil, Mythic";
        foilRarity = "1.6%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Am+is%3Amanafoil";
    } else if (foilRoll <= 90.0) {
        foilType = "Special Guests (Foil)";
        foilRarity = "5.5%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Aspg+date%3A2024-11-15";
    } else if (foilRoll <= 99.0) {
        foilType = "Japan Showcase (Foil)";
        foilRarity = "9.0%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Am++is%3Ashowcase";
    } else {
        foilType = "Japan Showcase (Fracture Foil)";
        foilRarity = "1.0%";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Am+is%3Afracturefoil";
    }

    let response = await fetch(foilLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    foilName = card.name;
    window.cardInfo.foil = [foilName, foilType, foilRarity];

    foilPrice = convertCurrency(card.prices.usd_foil * priceCut);

    // Replace Img Source
    foilImagePrimary = card.image_uris.normal;
    foilImageElement = document.getElementById("foil-image");
    foilImageElement.src = foilImagePrimary;

    //  When card has loaded...Flip and wait accordingly
    let foilStack = foilImageElement.parentElement;
    foilStack = document.getElementById("foil-image").closest(".both-cards");
    foilImageElement.addEventListener("load", cardImageLoaded(foilImageElement, foilImagePrimary, foilStack));

    //  Add foil effect
    if (foilType == "Mana-foil, Rare" || foilType == "Mana-foil, Mythic") {
        foilImageElement.previousElementSibling.classList.add("mana-gradient");
    } else {
        foilImageElement.previousElementSibling.classList.remove("mana-gradient");
    }

    //  Insert Price
    const foilPriceElement = document.getElementById("foil-price");
    foilPriceElement.innerText = USDollar.format(foilPrice);

    //  Insert Roll
    const foilRollElement = document.getElementById("foil-roll");
    foilRollElement.innerText = "Roll: " + foilRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(foilPrice);
}

async function landPull_FDN() {
    // Foil full-art land
    // set:fdn type:basic is:fullart
    landLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+type%3Abasic+is%3Afullart";
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
