const ghostLinkHalf_FIN = "https://api.scryfall.com/cards/random?q=%28set%3Afin+OR+set%3Afic+OR+set%3Afca%29+";
const topOutLink_FIN = "https://api.scryfall.com/cards/search?order=usd&q=%28set%3Afin+OR+set%3Afic+OR+set%3Afca%29+unique%3Aprints+USD%3E%3D15";
const boosterType_FIN = "Collector";

window.setName = "FIN";
window.FIN = {
    totalCards: 15,
};
window.cardInfo = window.cardInfo || {};

function setFIN() {
    currentSet = "FIN";
    document.cookie = "currentSet = 'FIN'";
    boosterValue = 100;
    CAN_boosterValue = 160;
    msrp = 37.99;

    priceCutActive = true;
    priceCut = 1;

    document.getElementById("set-header").innerText = "FINAL FANTASY";
    document.getElementById("booster-type").innerText = boosterType_FIN + " Booster";

    document.body.style.backgroundImage = "url(img/FIN_bg2_dark.jpg)";
    clearSlots();
    makeFINSlots();
    clearMoney();
    changeSet();
}

function makeFINSlots() {
    makeSlot("fchoco", "Foil R, M, or Chocobo", true);
    makeSlot("fca", "Through the Ages", true);
    makeSlot("bfr-1", "Booster Fun (R/M) #1", true);
    makeSlot("bfr-2", "Booster Fun (R/M) #2", true);
    makeSlot("bfr-3", "Booster Fun (R/M) #3", true);
    makeSlot("defaultrare", "Foil Rare or Mythic", true);
    makeSlot("nfbfcu", "Booster Fun (C/U)");
    makeSlot("foilbfcu", "Foil Booster Fun (C/U)", true);
    makeSlot("basicland", "Foil Basic Land", true);
    makeSlot("uncommon", "Foil Uncommons", true, 3);
    makeSlot("common", "Foil Commons", true, 3);
}

function pullFIN() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        // ghostPull_FIN();

        commonPull_FIN();

        uncommonPull_FIN();

        defaultRarePull_FIN();

        basicLandPull_FIN();

        nfBFCUPull_FIN();

        foilBFCU_FIN();

        threeBFRaresPull_FIN();

        fcaPull_FIN();

        foilOrChocoPull_FIN();

        sumTotals();
    } else {
    }
}

async function commonPull_FIN() {
    //  Get card from Scryfall
    for (j = 1; j < 4; j++) {
        let response = await fetch("https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Ac+-type%3Abasic");
        let commonCard = await response.json();
        commonName = commonCard.name;
        commonPrice = convertCurrency(commonCard.prices.usd * priceCut);

        //  Replace Img Source, check for DFC
        commonImage = commonCard.image_uris.normal;

        var commonImageId = "common-image-" + j;
        commonImageElement = document.getElementById(commonImageId);
        commonImageElement.src = commonImage;

        //  Create Common Sum Element
        commonSum = commonSum + commonPrice;

        //  Push price to price array
        myPrices.push(commonPrice);

        const commonStack = document.getElementById("common-image-" + j).parentElement;
        commonImageElement.addEventListener("load", cardImageLoaded(commonImageElement, commonImage, commonStack));
    }

    window.cardInfo.common = ["3 Main-set Commons", "Appears 100% of the time."];

    const commonSumElement = document.getElementById("common-sum");
    commonSumElement.innerText = commonSum;

    // Set Sum on page, clear value.
    commonSumElement.innerText = "$" + commonSum;
    // commonSum = 0;
}

async function uncommonPull_FIN() {
    uncommonSet = document.getElementById("uncommon-set");

    //  Get card from Scryfall
    for (k = 1; k < 4; k++) {
        //  Roll for Cid (the Cid slot is 1 of 109 Uncommons. There are 15 Cid alt-arts between CN 407-416).
        let cidRoll = getRandomInt(1, 109);
        if (cidRoll == 109) {
            response = await fetch("https://api.scryfall.com/cards/random?q=set%3Afin+cn>%3D407+and+cn<%3D416+unique%3Aart");
        } else {
            response = await fetch("https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Au+-name%3D%27Ragnarok%27&unique=cards");
        }

        let uncommonCard = await response.json();

        uncommonName = uncommonCard.name;
        uncommonPrice = convertCurrency(uncommonCard.prices.usd * priceCut);

        //  Replace Img Source, check for DFC
        if (uncommonCard.layout == "transform" || uncommonCard.layout == "modal_dfc") {
            uncommonImage = uncommonCard.card_faces[0].image_uris.normal;
        } else {
            uncommonImage = uncommonCard.image_uris.normal;
        }

        var uncommonImageId = "uncommon-image-" + k;
        uncommonImageElement = document.getElementById(uncommonImageId);
        uncommonImageElement.src = uncommonImage;

        const uncommonStack = document.getElementById("uncommon-image-" + k).parentElement;
        uncommonImageElement.addEventListener("load", cardImageLoaded(uncommonImageElement, uncommonImage, uncommonStack));

        //  Create Uncommon Sum Element
        uncommonSum = uncommonSum + uncommonPrice;

        //  Push price to price array
        myPrices.push(uncommonPrice);
    }

    window.cardInfo.uncommon = ["3 Main-set Uncommons", "Appears 100% of the time."];

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function defaultRarePull_FIN() {
    defaultRareRoll = getRandomNumber(0, 100);
    var defaultRareLink = "";

    // Override roll
    // defaultRareRoll = 99;

    if (defaultRareRoll <= 87.75) {
        //  1 Traditional foil default frame Rare (87.75%);
        //  set:fin rarity:r
        defaultRareType = "Default Frame, Rare (Foil)";
        defaultRareRarity = "87.75%";
        defaultRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Ar";
    } else {
        //  1 Traditional foil default frame Mythic (12.25%)
        //  set:fin rarity:m
        defaultRareType = "Default Frame, Mythic (Foil)";
        defaultRareRarity = "12.25%";
        defaultRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Am+%28-CN%3A552+AND+-CN%3A553%29+-is%3Aboosterfun";
    }

    let response = await fetch(defaultRareLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    defaultRareName = card.name;
    window.cardInfo.defaultrare = [defaultRareName, defaultRareType, defaultRareRarity];

    defaultRarePrice = convertCurrency(card.prices.usd_foil * priceCut);

    // TO FIX: figure out if DFC....
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        defaultRareImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        defaultRareImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    defaultRareImageElement = document.getElementById("defaultrare-image");

    //  When New Modern Image has loaded...Flip and wait accordingly
    const defaultRareStack = document.getElementById("defaultrare-image").closest(".both-cards");
    defaultRareImageElement.addEventListener("load", cardImageLoaded(defaultRareImageElement, defaultRareImagePrimary, defaultRareStack));

    //  Insert Price
    const defaultRarePriceElement = document.getElementById("defaultrare-price");
    defaultRarePriceElement.innerText = USDollar.format(defaultRarePrice);

    //  Insert Roll
    const defaultRareRollElement = document.getElementById("defaultrare-roll");
    defaultRareRollElement.innerText = "Roll: " + defaultRareRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(defaultRarePrice);
}

async function nfBFCUPull_FIN() {
    let nfBFCUType = "unknown";
    let nfBFCURoll = getRandomNumber(0, 100);

    if (nfBFCURoll <= 66.7) {
        // 1 of 40 Extended-art legendary uncommons (66.7%)
        // set:fin frame:extendedart rarity:u type:legendary
        nfBFCUType = "Extended-art Legendary,  Uncommon";
        nfBFCURarity = "66.7%";
        nfBFCULink =
            "https://api.scryfall.com/cards/random?q=set%3Afin+frame%3Aextendedart+rarity%3Au+type%3Alegendary+-name%3D'Ragnarok%2C+Divine+Deliverance'&unique=cards";
    } else if (nfBFCURoll <= 71.7) {
        // 1 of 3 Main set Booster Fun commons (5%)
        // set:fin is:boosterfun rarity:c -type:basic
        nfBFCUType = "Booster Fun, Common";
        nfBFCURarity = "5.0%";
        nfBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afin+is%3Aboosterfun+rarity%3Ac+-type%3Abasic";
    } else if (nfBFCURoll <= 98.4) {
        // 1 of 13 Main set Booster Fun Uncommons (26.7%)
        // set:fin is:boosterfun rarity:u (CN>=324 AND CN<=373)
        nfBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afin+is%3Aboosterfun+rarity%3Au+%28CN>%3D324+AND+CN<%3D373%29";
        nfBFCURarity = "26.7%";
        nfBFCUType = "Booster Fun, Uncommon";
    } else {
        // 1 of 3 Alternate-art Secret Rendezvous uncommons (1.6%)
        // set:fic (CN>=217 AND CN<=219) unique:art
        nfBFCUType = "Alternate-art Secret Rendezvous, Uncommon";
        nfBFCURarity = "1.6%";
        nfBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afic+%28CN>%3D217+AND+CN<%3D219%29+unique%3Aart";
    }

    let response = await fetch(nfBFCULink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    nfBFCUName = card.name;
    window.cardInfo.nfbfcu = [nfBFCUName, nfBFCUType, nfBFCURarity];

    nfBFCUdPrice = convertCurrency(card.prices.usd * priceCut);

    //  Replace Img Source
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        nfBFCUImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        nfBFCUImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    nfBFCUImageElement = document.getElementById("nfbfcu-image");

    //  When Wildcard Image has loaded...Flip and wait accordingly
    const nfBFCUStack = document.getElementById("nfbfcu-image").parentElement;
    nfBFCUImageElement.addEventListener("load", cardImageLoaded(nfBFCUImageElement, nfBFCUImagePrimary, nfBFCUStack));

    //  Insert Price
    nfBFCUPrice = convertCurrency(card.prices.usd * priceCut) ? convertCurrency(card.prices.usd * priceCut) : 0;
    const nfBFCUPriceElement = document.getElementById("nfbfcu-price");
    nfBFCUPriceElement.innerText = USDollar.format(nfBFCUPrice);

    //  Insert Roll
    const nfBFCURollElement = document.getElementById("nfbfcu-roll");
    nfBFCURollElement.innerText = "Roll: " + nfBFCURoll.toFixed(0);

    //  Push price to price array
    myPrices.push(nfBFCUPrice);
}

async function foilBFCU_FIN() {
    foilBFCURoll = getRandomNumber(0, 100);

    let foilBFCULink = "";

    // Override roll
    // foilBFCURoll = 99;

    let foilBFCUType = "unknown";
    if (foilBFCURoll <= 13.75) {
        //  1 of 3 Main set Booster Fun commons (13.75%)
        //  set:fin is:boosterfun rarity:c -type:basic
        foilBFCUType = "Booster Fun, Common (Foil)";
        foilBFCURarity = "13.75%";
        foilBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afin+%28CN%3D369+OR+CN%3D358+OR+CN%3D371%29";
    } else if (foilBFCURoll <= 86.5) {
        //  1 of 13 Main set Booster Fun Uncommons (72.75%)
        //  set:fin rarity:u (CN>=324 AND CN<=373)
        foilBFCUType = "Booster Fun, Uncommon (Foil)";
        foilBFCURarity = "72.75%";
        foilBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Au+%28CN>%3D324+AND+CN<%3D373%29";
    } else if (foilBFCURoll <= 91) {
        //  1 of 3 Alternate-art Secret Rendezvous uncommons (4.5%)
        //  set:fic (CN>=217 AND CN<=219) unique:art
        foilBFCUType = "Alternate-art Secret Rendezvous, Uncommon (Foil)";
        foilBFCURarity = "4.5%";
        foilBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afic+%28CN>%3D217+AND+CN<%3D219%29+unique%3Aart";
    } else {
        //  1 of 4 Surge Foil Uncommon Borderless Character Cards (9%)
        //  set:fin rarity:u (CN>=519 AND CN<=550) -CN=526b
        foilBFCUType = "Borderless Character Card, Uncommon (Surge Foil)";
        foilBFCURarity = "9.0%";
        foilBFCULink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Au+%28CN>%3D519+AND+CN<%3D550%29+-CN%3D526b+";
    }

    let response = await fetch(foilBFCULink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    foilBFCUName = card.name;
    window.cardInfo.foilbfcu = [foilBFCUName, foilBFCUType, foilBFCURarity];

    foilBFCUPrice = convertCurrency(card.prices.usd_foil * priceCut) ? convertCurrency(card.prices.usd_foil * priceCut) : 0;

    //  Replace Img Source
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        foilBFCUImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        foilBFCUImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    foilBFCUImageElement = document.getElementById("foilbfcu-image");

    //  When Foil Image has loaded...Flip and wait accordingly
    const foilBFCUStack = document.getElementById("foilbfcu-image").closest(".both-cards");
    foilBFCUImageElement.addEventListener("load", cardImageLoaded(foilBFCUImageElement, foilBFCUImagePrimary, foilBFCUStack));

    if (foilBFCUType == "Surge Foil Uncommon Borderless Character Card") {
        foilBFCUImageElement.previousElementSibling.classList.add("surge-gradient");
    } else {
        foilBFCUImageElement.previousElementSibling.classList.remove("surge-gradient");
    }

    //  Insert Price
    const foilBFCUPriceElement = document.getElementById("foilbfcu-price");
    foilBFCUPriceElement.innerText = USDollar.format(foilBFCUPrice);

    //  Insert Roll
    const foilBFCURollElement = document.getElementById("foilbfcu-roll");
    foilBFCURollElement.innerText = "Roll: " + foilBFCURoll.toFixed(0);

    //  Push price to price array
    myPrices.push(foilBFCUPrice);
}

async function basicLandPull_FIN() {
    basicLandRoll = getRandomNumber(0, 100);
    var basicLandLink = "";

    basicLandLink = "https://api.scryfall.com/cards/random?q=set%3Afin+type%3Abasic+unique%3Aart&unique=cards";
    basicLandRarity = "100%";
    basicLandType = "Basic Land";

    let response = await fetch(basicLandLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    basicLandName = card.name;
    window.cardInfo.basicland = [basicLandName, basicLandType, basicLandRarity];

    // Set price
    basicLandPrice = convertCurrency(card.prices.usd_foil * priceCut);

    basicLandImagePrimary = card.image_uris.normal;

    //  Replace Img Source
    basicLandImageElement = document.getElementById("basicland-image");

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const basicLandStack = basicLandImageElement.closest(".both-cards");
    basicLandImageElement.addEventListener("load", cardImageLoaded(basicLandImageElement, basicLandImagePrimary, basicLandStack));

    //  Insert Price
    const basicLandPriceElement = document.getElementById("basicland-price");
    basicLandPriceElement.innerText = USDollar.format(basicLandPrice);

    //  Push price to price array
    myPrices.push(basicLandPrice);
}

function bfRareSingleRoll(allowFoil = true) {
    let bfRareRoll;
    let hitFoil = false;
    if (allowFoil) {
        bfRareRoll = getRandomNumber(0, 100);
        // console.log("full rolling");
    } else {
        bfRareRoll = getRandomNumber(0, 91.0);
        // console.log("no-foil rolling");
    }

    if (bfRareRoll > 91.0) {
        // console.log("WE HIT FOIL");
        hitFoil = true;
    }

    // Override roll
    // bfRareRoll = 53;

    var bfRareLink = "";
    let foilType = "";

    if (bfRareRoll <= 23.1) {
        //  set:fin is:boosterfun rarity:r unique:art
        bfRareType = "Booster Fun, Rare";
        bfRareRarity = "23.1%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+is%3Aboosterfun+rarity%3Ar+unique%3Aart&unique=cards";
    } else if (bfRareRoll <= 26.9) {
        //  set:fin is:boosterfun rarity:m unique:art (-CN=551 AND -CN=551a AND -CN=551b AND -CN=551c AND -CN=551d AND -CN=551e AND -CN=551f)
        //  Ignore colorful Chocobos!
        bfRareType = "Booster Fun, Mythic";
        bfRareRarity = "3.8%";
        bfRareLink =
            "https://api.scryfall.com/cards/random?q=set%3Afin+is%3Aboosterfun+rarity%3Am+unique%3Aart+%28-CN%3D551+AND+-CN%3D551a+AND+-CN%3D551b+AND+-CN%3D551c+AND+-CN%3D551d+AND+-CN%3D551e+AND+-CN%3D551f%29&unique=cards";
    } else if (bfRareRoll <= 45.1) {
        //  set:fin frame:extendedart type:legendary rarity:r unique:art
        bfRareType = "Extended-art Legendary Creature, Rare";
        bfRareRarity = "18.2%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+frame%3Aextendedart+type%3Alegendary+rarity%3Ar+unique%3Aart";
    } else if (bfRareRoll <= 48.0) {
        //  set:fin frame:extendedart type:legendary rarity:r unique:art
        bfRareType = "Extended-art Legendary Creature, Mythic";
        bfRareRarity = "2.9%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+frame%3Aextendedart+type%3Alegendary+rarity%3Am+unique%3Aart";
    } else if (bfRareRoll <= 50.9) {
        //  set:fic is:boosterfun rarity:m unique:art (CN>=194 AND CN<=200)
        bfRareType = "Commander Set Booster Fun, Rare";
        bfRareRarity = "2.9%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+is%3Aboosterfun+rarity%3Ar+unique%3Aart+%28CN>%3D194+AND+CN<%3D200%29&unique=cards";
    } else if (bfRareRoll <= 54.2) {
        //  set:fic is:boosterfun rarity:m unique:art
        bfRareType = "Commander Set Booster Fun, Mythic";
        bfRareRarity = "3.3%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+is%3Aboosterfun+rarity%3Am+CN<215+unique%3Aart&unique=cards";
    } else if (bfRareRoll <= 65.8) {
        //  set:fic rarity:r frame:extendedart -CN:228 (-type:"legendary creature" AND -type:"legendary artifact creature")
        //  !! Custom query, excludes Legendary Creatures and Herald's Horn, Buy-a-Box Promo
        bfRareType = "Commander Set Extended-art Non-Legendary, Rare";
        bfRareRarity = "11.6%";
        bfRareLink =
            "https://api.scryfall.com/cards/random?q=set%3Afic+rarity%3Ar+frame%3Aextendedart+-CN%3A228+%28-type%3A'legendary+creature'+AND+-type%3A'legendary+artifact+creature'%29";
    } else if (bfRareRoll <= 89.4) {
        //  set:fic frame:extendedart rarity:r (type:legendary and type:creature)
        bfRareType = "Commander Set Extended-art Legendary Creature, Rare";
        bfRareRarity = "23.6%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+frame%3Aextendedart+rarity%3Ar+%28type%3Alegendary+and+type%3Acreature%29";
    } else if (bfRareRoll <= 91.0) {
        //  set:fic frame:extendedart rarity:m (type:legendary and type:creature)
        bfRareType = "Commander Set Extended-art Legendary Creature, Mythic";
        bfRareRarity = "1.6%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+frame%3Aextendedart+rarity%3Am+%28type%3Alegendary+and+type%3Acreature%29";
    } else if (bfRareRoll <= 92.4) {
        //  set:fic is:boosterfun rarity:r CN>=194
        //  !!! Assuming the Commander set is implied, and that the group of 7 is 7 Summons
        bfRareType = "Booster Fun, Rare (Foil)";
        bfRareRarity = "1.4%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+is%3Aboosterfun+rarity%3Ar+CN>%3D194";
        foilType = "trad";
    } else if (bfRareRoll <= 98.2) {
        //  set:fic rarity:r frame:extendedart -CN:228 (-type:'legendary creature' AND -type:'legendary artifact creature')
        bfRareType = "Commander Set Extended-art Booster Fun, Rare (Foil)";
        bfRareRarity = "5.8%";
        bfRareLink =
            "https://api.scryfall.com/cards/random?q=set%3Afic+rarity%3Ar+frame%3Aextendedart+-CN%3A228+%28-type%3A'legendary+creature'+AND+-type%3A'legendary+artifact+creature'%29";
        foilType = "trad";
    } else if (bfRareRoll <= 99) {
        //  set:fic is:boosterfun rarity:m
        bfRareType = "Commander Set Extended-art , Mythic (Foil)";
        bfRareRarity = "0.8%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+rarity%3Am+is%3Aboosterfun+-is%3Aextendedart";
        foilType = "trad";
    } else {
        //  set:fic is:surge rarity:m (CN>=209 AND CN<=217)
        bfRareType = "Commander Set Extended-art, Mythic (Surge Foil)";
        bfRareRarity = "1%";
        bfRareLink = "https://api.scryfall.com/cards/random?q=set%3Afic+is%3Asurge+rarity%3Am+%28CN>%3D209+AND+CN<%3D217%29";
        foilType = "surge";
    }

    return [bfRareLink, hitFoil, foilType, bfRareType, bfRareRarity];
}

async function threeBFRaresPull_FIN() {
    let results = [];
    let foilUsed = false;

    for (l = 1; l < 4; l++) {
        // Do a full roll first.
        let thisBFRarePull = bfRareSingleRoll(!foilUsed);
        if (thisBFRarePull[1] === true) {
            foilUsed = true;
        }
        results.push(thisBFRarePull[2]);

        let response = await fetch(thisBFRarePull[0]);

        // waits until Scryfall fetch completes...
        let card = await response.json();
        bfRareName = card.name;

        // Set type for infopop
        window.cardInfo[`bfr-${l}`] = [bfRareName, bfRareType, bfRareRarity];

        //  Replace Img Source
        bfRareImageElement = document.getElementById("bfr-" + l + "-image");

        //  Set image
        if (card.layout == "transform" || card.layout == "modal_dfc") {
            bfRareImagePrimary = card.card_faces[0].image_uris.normal;
        } else {
            bfRareImagePrimary = card.image_uris.normal;
        }

        //  When Image has loaded...Flip and wait accordingly
        const bfRareStack = bfRareImageElement.closest(".both-cards");
        bfRareImageElement.addEventListener("load", cardImageLoaded(bfRareImageElement, bfRareImagePrimary, bfRareStack));

        bfRareImageElement.previousElementSibling.classList.remove("foil-gradient");
        bfRareImageElement.previousElementSibling.classList.remove("surge-gradient");

        if (thisBFRarePull[2] === "trad") {
            // Set price
            bfRarePrice = convertCurrency(card.prices.usd_foil * priceCut);
            bfRareImageElement.previousElementSibling.classList.add("foil-gradient");
        } else if (thisBFRarePull[2] === "surge") {
            bfRareImageElement.previousElementSibling.classList.add("foil-gradient");
            bfRareImageElement.previousElementSibling.classList.add("surge-gradient");
            bfRarePrice = convertCurrency(card.prices.usd_foil * priceCut);
        } else {
            bfRarePrice = convertCurrency(card.prices.usd * priceCut);
        }

        //  Insert Price
        const bfRarePriceElement = document.getElementById("bfr-" + l + "-price");
        bfRarePriceElement.innerText = USDollar.format(bfRarePrice);

        //  Push price to price array
        myPrices.push(bfRarePrice);
    }
}

async function fcaPull_FIN() {
    fcaRoll = getRandomNumber(0, 100);

    let fcaLink = "";

    // Override roll
    // fcaRoll = 93;

    let fcaType = "unknown";
    if (fcaRoll <= 68.3) {
        //  Uncommon (68.3%, 17 cards)
        //  set:fca rarity:u
        fcaType = "Through the Ages, Uncommon";
        fcaRarity = "68.3%";
        fcaLink = "https://api.scryfall.com/cards/random?q=set%3Afca+rarity%3Au";
    } else if (fcaRoll <= 94) {
        //  Rare (25.7%, 32 cards)
        //  set:fca rarity:r
        fcaType = "Through the Ages, Rare";
        fcaRarity = "25.7%";
        fcaLink = "https://api.scryfall.com/cards/random?q=set%3Afca++rarity%3Ar+-cn%3A'A-19'";
    } else {
        //  Mythic (6%, 15 cards)
        //  set:fca rarity:m
        fcaType = "Through the Ages, Mythic";
        fcaRarity = "6.0%";
        fcaLink = "https://api.scryfall.com/cards/random?q=set%3Afca+rarity%3Am";
    }

    let response = await fetch(fcaLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    fcaName = card.flavor_name + " (" + card.name + ")";
    window.cardInfo.fca = [fcaName, fcaType, fcaRarity];

    //  Replace Img Source
    fcaImagePrimary = card.image_uris.normal;
    fcaImageElement = document.getElementById("fca-image");

    //  When Image has loaded...Flip and wait accordingly
    fcaImageElement.previousElementSibling.classList.remove("foil-gradient");

    //  Apply foil in 50% of rolls
    if (getRandomInt(1, 2) === 2) {
        fcaType = fcaType + " (Foil)";
        window.cardInfo.fca = [fcaName, fcaType, fcaRarity];
        fcaImageElement.previousElementSibling.classList.add("foil-gradient");
        fcaPrice = convertCurrency(card.prices.usd_foil * priceCut) ? convertCurrency(card.prices.usd_foil * priceCut) : 0;
    } else {
        // Non-foil
        fcaPrice = convertCurrency(card.prices.usd * priceCut) ? convertCurrency(card.prices.usd * priceCut) : 0;
    }

    const fcaStack = document.getElementById("fca-image").closest(".both-cards");
    fcaImageElement.addEventListener("load", cardImageLoaded(fcaImageElement, fcaImagePrimary, fcaStack));

    //  Insert Price
    const fcaPriceElement = document.getElementById("fca-price");
    fcaPriceElement.innerText = USDollar.format(fcaPrice);

    //  Insert Roll
    const fcaRollElement = document.getElementById("fca-roll");
    fcaRollElement.innerText = "Roll: " + fcaRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(fcaPrice);
}

async function foilOrChocoPull_FIN() {
    chocoRareRoll = getRandomNumber(0, 100);

    let chocoRareLink = "";

    // Override roll
    // chocoRareRoll = 99.8;

    let fchocoType = "unknown";
    if (chocoRareRoll <= 1.9) {
        //  1 of 3 Traditional foil Artist Rares (1.9%, 3 cards)
        //  set:fin rarity:r (a:"akihiko yoshida" or a:"toshitaka matsuda" or a:"roberto ferrari")
        fchocoType = "Featured Artist, Rare (Foil) ";
        fchocoRarity = "1.9%";
        chocoRareLink =
            "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Ar+%28a%3A'akihiko+yoshida'+or+a%3A'toshitaka+matsuda'+or+a%3A'roberto+ferrari'%29";
    } else if (chocoRareRoll <= 4.1) {
        //  1 of 7 Traditional foil Artist Mythics (2.2%, 7 cards)
        //  set:fin rarity:m (a:"yoshitaka amano" or a:"toshiyuki itahana" or a:"tetsuya nomura" or a:"isamu kamikokuryo" or a:"kazuya takahashi" or a:"yusuke mogi")
        fchocoType = "Featured Artist, Mythic (Foil)";
        fchocoRarity = "2.2%";
        chocoRareLink =
            "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Am+%28a%3A'yoshitaka+amano'+or+a%3A'toshiyuki+itahana'+or+a%3A'tetsuya+nomura'+or+a%3A'isamu+kamikokuryo+or+a%3A'kazuya+takahashi'+or+a%3A'yusuke+mogi'%29";
    } else if (chocoRareRoll <= 40.6) {
        //  Traditional foil borderless woodblock Rare (36.5%, 29 cards)
        //  set:fin rarity:r (CN>=324 AND CN<=373)
        fchocoType = "Borderless Woodblock, Rare (Foil)";
        fchocoRarity = "36.5%";
        chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Ar+%28CN>%3D324+AND+CN<%3D373%29";
    } else if (chocoRareRoll <= 44.4) {
        //  Traditional foil borderless Woodblock Mythic (3.8%, 6 cards)
        //  set:fin rarity:m (CN>=334 AND CN<=359)
        fchocoType = "Borderless Woodblock, Rare (Foil) ";
        fchocoRarity = "3.8%";
        chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Am+%28CN>%3D334+AND+CN<%3D359%29";
    } else if (chocoRareRoll <= 76.0) {
        //  Traditional foil main set borderless Rare (31.6%, 26 cards)
        //  set:fin rarity:r is:borderless (CN<320 OR CN>373)
        fchocoType = "Borderless, Rare (Foil)";
        fchocoRarity = "31.6%";
        chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Ar+is%3Aborderless+%28CN<320+OR+CN>373%29";
    } else if (chocoRareRoll <= 81.6) {
        //  Traditional foil main set borderless Mythic (5.6%, 9 cards)
        //  set:fin rarity:m is:borderless (CN>=375 AND CN<=406)
        fchocoType = "Borderless, Mythic (Foil)";
        fchocoRarity = "5.6%";
        chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Am+is%3Aborderless+%28CN>%3D375+AND+CN<%3D406%29";
    } else if (chocoRareRoll <= 96.7) {
        //  Surge foil borderless character Rare (15.1%, 20 cards)
        //  set:fin rarity:r (CN>=374 AND CN<=405)
        fchocoType = "Borderless Character, Rare (Surge Foil)";
        fchocoRarity = "15.1%";
        chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+has%3Asurge+is%3Aborderless+rarity%3Ar&unique=cards";
    } else if (chocoRareRoll <= 99.7) {
        //  Surge foil borderless character Mythic (3.0%, 8 cards)
        //  set:fin rarity:m (CN>=519 AND CN<=550)
        fchocoType = "Borderless Character, Mythic (Surge Foil)";
        fchocoRarity = "3.0%";
        chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+rarity%3Am+%28CN>%3D519+AND+CN<%3D550%29";
    } else {
        //  Traveling Chocobo in one of five colors
        //  set:fin CN="551b"
        fchocoType = "Colorful Traveling Chocobo";
        fchocoRarity = "< 1%";

        let colorChocoRoll = getRandomInt(1, 5);
        switch (colorChocoRoll) {
            case 1:
                chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+cn%3A'551a'";
                break;
            case 2:
                chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+cn%3A'551b'";
                break;
            case 3:
                chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+cn%3A'551c'";
                break;
            case 4:
                chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+cn%3A'551d'";
                break;
            default:
                chocoRareLink = "https://api.scryfall.com/cards/random?q=set%3Afin+cn%3A'551'";
                break;
        }
    }

    let response = await fetch(chocoRareLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    fchocoName = card.name;
    window.cardInfo.fchoco = [fchocoName, fchocoType, fchocoRarity];

    // Set Price
    chocoRarePrice = convertCurrency(card.prices.usd_foil * priceCut) ? convertCurrency(card.prices.usd_foil * priceCut) : 0;

    //  Replace Img Source
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        chocoRareImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        chocoRareImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    chocoRareImageElement = document.getElementById("fchoco-image");

    //  When Foil Image has loaded...Flip and wait accordingly
    const chocoRareStack = document.getElementById("fchoco-image").closest(".both-cards");
    chocoRareImageElement.addEventListener("load", cardImageLoaded(chocoRareImageElement, chocoRareImagePrimary, chocoRareStack));

    if (fchocoType.includes("Surge Foil")) {
        chocoRareImageElement.previousElementSibling.classList.add("surge-gradient");
    } else {
        chocoRareImageElement.previousElementSibling.classList.remove("surge-gradient");
    }

    //  Insert Price
    const chocoRarePriceElement = document.getElementById("fchoco-price");
    chocoRarePriceElement.innerText = USDollar.format(chocoRarePrice);

    //  Insert Roll
    const chocoRareRollElement = document.getElementById("fchoco-roll");
    chocoRareRollElement.innerText = "Roll: " + chocoRareRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(chocoRarePrice);
}
