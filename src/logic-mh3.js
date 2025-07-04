const ghostLinkHalf_MH3 = "https://api.scryfall.com/cards/random?q=%28set%3Afin+OR+set%3Afic+OR+set%3Afca%29+";
const topOutLink_MH3 = "https://api.scryfall.com/cards/search?order=usd&q=%28set%3Afin+OR+set%3Afic+OR+set%3Afca%29+unique%3Aprints+USD%3E%3D15";
const boosterType_MH3 = "Play";

let rareFirstFlip = true;

window.setName = "MH3";
window.MH3 = {
    totalCards: 12,
};

function setMH3() {
    currentSet = "MH3";
    document.cookie = "currentSet = 'MH3'";
    boosterValue = 8;

    document.getElementById("set-header").innerText = "MODERN HORIZONS 3";
    document.getElementById("booster-type").innerText = boosterType_MH3;
    document.getElementById("set-toggle-1").innerText = "go foundations";
    document.getElementById("set-toggle-1").addEventListener("click", () => {
        setFDN();
    });
    document.getElementById("set-toggle-2").innerText = "go duskmourn";
    document.getElementById("set-toggle-2").addEventListener("click", () => {
        setDSK();
    });
    document.getElementById("set-toggle-3").innerText = "go final fantasy";
    document.getElementById("set-toggle-3").addEventListener("click", () => {
        setFIN();
    });
    document.body.style.backgroundImage = "url(img/MH3_bg.png)";

    clearSlots();
    makeMH3Slots();
    clearMoney();
}

function makeMH3Slots() {
    makeSlot("rare", "Rare");
    makeSlot("new-modern", "New-to-Modern");
    makeSlot("wildcard", "Non-Foil Wildcard");
    makeSlot("foil", "Foil Wildcard", true);
    makeSlot("landcommon", "Land or Common", true);
    makeSlot("uncommon", "Uncommons", false, 3);
    makeSlot("common", "Commons", false, 6);
}

function pullMH3() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        ghostPull_MH3();

        commonPull_MH3();

        uncommonPull_MH3();

        rarePull_MH3();

        newModernPull_MH3();

        landcommonPull_MH3();

        wildcardPull_MH3();

        foilPull_MH3();

        sumTotals_MH3();
    } else {
        console.log("already working");
    }
}

function rollForWildcard() {
    // Wildcard roll
    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    // Random number between 0 and 100
    wildcardRoll = getRandomNumber(0, 100);

    wildcardLink = "";

    // Override roll
    // wildcardRoll = 95.1;

    let wildcardType = "unknown";
    if (wildcardRoll <= 41.7) {
        wildcardType = "Wildcard Common";
        // Common (41.7%)
        // rarity:c, is:firstprinting
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+is%3Afirstprinting+rarity%3Ac";
    } else if (wildcardRoll <= 75.1) {
        // Uncommon, not DFC (33.4%)
        // rarity:u, is:first-printing not:dfc
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Au+is%3Afirst-printing+not%3Adfc";
        wildcardType = "Wildcard Uncommon non-DFC";
    } else if (wildcardRoll <= 83.4) {
        // Uncommon DFC (8.3%)
        // rarity:u is:first-printing is:dfc
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Au+is%3Afirst-printing+is%3Adfc";
        wildcardType = "Wildcard Uncommon DFC";
    } else if (wildcardRoll <= 90.1) {
        // Rare (6.7%)
        // rarity:r (is:first-printing OR is:fetchland)
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Ar+%28is%3Afirst-printing+OR+is%3Afetchland%29";
        wildcardType = "Wildcard Rare";
    } else if (wildcardRoll <= 91.2) {
        // Mythic (1.1%)
        // rarity:u is:first-printing is:dfc
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Am+is%3Afirst-printing";
        wildcardType = "Wildcard Mythic";
    } else if (wildcardRoll <= 91.6) {
        // Borderless (0.4%)

        //  Borderless roll
        const getWildcardBorderlessRandom = () => {
            return Math.random() * (57 - 0);
        };
        // Random number between 0 and 100
        wildcardBorderlessRandom = getWildcardBorderlessRandom();
        if (wildcardBorderlessRandom <= 23) {
            // is Borderless Frame Break, 23 cards
            // (rarity:r or rarity:m) is:first-printing (type:creature OR type:instant OR type:sorcery OR type:enchantment) is:borderless -type:legendary
            wildcardLink =
                "https://api.scryfall.com/cards/random?q=set%3Amh3+is%3Afirstprinting+%28type%3Acreature+OR+type%3Ainstant+OR+type%3Asorcery+OR+type%3Aenchantment%29+is%3Aborderless+-type%3Alegendary";
            wildcardType = "Wildcard Borderless Frame Break";
        } else if (wildcardBorderlessRandom <= 39) {
            // is Other Borderless including DFC and fetchlands
            // (rarity:r or rarity:m) (is:borderless OR frame:extendedart) (is:dfc or is:fetchland or name="Ugin's Labyrinth") unique:art
            wildcardLink =
                'https://api.scryfall.com/cards/random?q=set%3Amh3+%28rarity%3Ar+or+rarity%3Am%29+%28is%3Aborderless+OR+frame%3Aextendedart%29+%28is%3Adfc+or+is%3Afetchland+or+name%3D"Ugin%27s+Labyrinth"%29+unique%3Aart';
            wildcardType = "Wildcard Other Borderless (DFC, Fetchland, Ugin's Labyrinth)";
        } else if (wildcardBorderlessRandom <= 54) {
            // is Borderless Profile
            // (rarity:r or rarity:m) is:first-printing -is:DFC is:borderless (type:creature AND type:legendary AND -is:concept AND -name="emrakul")
            wildcardLink =
                'https://api.scryfall.com/cards/random?q=set%3Amh3+%28rarity%3Ar+or+rarity%3Am%29+is%3Afirst-printing+-is%3ADFC+is%3Aborderless+%28type%3Acreature+AND+type%3Alegendary+AND+-is%3Aconcept+AND+-name%3D"emrakul"%29';
            wildcardType = "Wildcard Borderless Profile";
        } else {
            // is Concept Eldrazi
            // is:concept
            wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+is%3Aconcept";
            wildcardType = "Wildcard Concept Eldrazi";
        }
    } else if (wildcardRoll <= 95.8) {
        // Retro frame including new-to-Modern uncommons (4.2%)
        // frame:old ((is:firstprinting  and is:fetchland) or (rarity:c or rarity:r or rarity:m) or (rarity:u and is:firstprinting))
        // In other words, all old-borders, *including* five Rare fetches, *including* four new-to-modern Uncommons, *excluding* Mythic Recruiter of the Guard (not new)
        wildcardLink =
            "https://api.scryfall.com/cards/random?q=set%3Amh3+frame%3Aold+%28%28is%3Afirstprinting++and+is%3Afetchland%29+or+%28rarity%3Ac+or+rarity%3Ar+or+rarity%3Am%29+or+%28rarity%3Au+and+is%3Afirstprinting%29%29";
        wildcardType = "Wildcard Retro Frame";
    } else if (wildcardRoll <= 99.5) {
        // Commander Mythic Rare (8 cards)
        // set:m3c rarity:m is:firstprinting
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Am3c+rarity%3Am+is%3Afirstprinting";
        wildcardType = "Wildcard Commander Mythic";
    } else {
        //  Snow-Covered Waste, < 0.1%
        //  type:snow
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+type%3Asnow";
        wildcardType = "Wildcard Snow-Covered Wastes";
    }

    return wildcardLink;
}

function ghostPull_MH3() {
    // Set prices and link
    totalBoosterSpend = (boostersBought + 1) * boosterValue;
    boosterSpendTop = convertToUSD(totalBoosterSpend + totalBoosterSpend * 0.12);
    boosterSpendBottom = convertToUSD(totalBoosterSpend - totalBoosterSpend * 0.12);

    ghostLinkHalf = "https://api.scryfall.com/cards/random?q=set%3Amh3+unique%3Aprints+";
    ghostLinkConstructed = ghostLinkHalf + "USD>%3D" + boosterSpendBottom + "+" + "USD<%3D" + boosterSpendTop;

    topOutLink = "https://api.scryfall.com/cards/search?order=usd&q=set%3Amh3+unique%3Aprints+USD%3E%3D15";

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

            if (ghostCard.prices.usd == !null) {
                ghostPrice = ghostCard.prices.usd;
            } else {
                ghostPrice = ghostCard.prices.usd_foil;
            }

            if (totalBoosterSpend <= ghostPrice) {
                ghostLink = ghostLinkConstructed;

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
}

async function commonPull_MH3() {
    //  Get card from Scryfall
    for (j = 1; j < 7; j++) {
        // If we hit on SPG roll...
        commonSPGRollRaw = getRandomNumber(1, 64);
        commonSPGRoll = Math.round(commonSPGRollRaw);
        // Override roll
        // commonSPGRoll = 64;

        for (j = 1; j < 7; j++) {
            if (commonSPGRoll === 64 && j === 6) {
                // Special Guest, set:spg date:2024-06-07
                commonType = "Special Guest";
                commonSPGLink = "https://api.scryfall.com/cards/random?q=set%3Aspg+cn≥39+cn≤48+%28game%3Apaper%29";
                let response = await fetch(commonSPGLink);
                let commonSPGCard = await response.json();
                commonName = commonSPGCard.name;
                commonPrice = convertCurrency(commonSPGCard.prices.usd);

                //  Replace Img Source, check for DFC
                commonSPGImage = commonSPGCard.image_uris.normal;

                var commonSPGImageId = "common-image-" + j;
                commonSPGImageElement = document.getElementById(commonSPGImageId);
                commonSPGImageElement.src = commonSPGImage;

                var commonSPGPrice = Number(commonSPGCard.prices.usd);
                if (currencyMode == "CAD") {
                    commonSPGPrice = Number(fx(commonSPGPrice).from("USD").to("CAD"));
                } else {
                }

                //  Create Common Sum Element
                commonSum = commonSum + commonSPGPrice;

                //  Push price to price array
                myPrices.push(commonSPGPrice);
            } else {
                let response = await fetch("https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Ac+is%3Afirst-printing");
                let commonCard = await response.json();
                commonName = commonCard.name;
                commonPrice = convertCurrency(commonCard.prices.usd);

                //  Replace Img Source, check for DFC
                commonImage = commonCard.image_uris.normal;

                var commonImageId = "common-image-" + j;
                commonImageElement = document.getElementById(commonImageId);
                commonImageElement.src = commonImage;

                var commonPrice = Number(commonCard.prices.usd);
                if (currencyMode == "CAD") {
                    commonPrice = Number(fx(commonPrice).from("USD").to("CAD"));
                } else {
                }

                //  Create Common Sum Element
                commonSum = commonSum + commonPrice;

                //  Push price to price array
                myPrices.push(commonPrice);
            }

            const commonStack = document.getElementById("common-image-" + j).parentElement;
            commonImageElement.addEventListener("load", cardImageLoaded(commonImageElement, commonImage, commonStack));
        }
        const commonSumElement = document.getElementById("common-sum");
        commonSumElement.innerText = commonSum;

        // Set Sum on page, clear value.
        commonSumElement.innerText = "$" + commonSum.toFixed(2);
        // commonSum = 0;
    }
}

async function uncommonPull_MH3() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");
    // while (uncommonSet.firstChild) {
    //   uncommonSet.removeChild(uncommonSet.lastChild);
    // }
    //  Get card from Scryfall
    for (k = 1; k < 4; k++) {
        let response = await fetch("https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Au+is%3Afirstprinting");
        let uncommonCard = await response.json();
        uncommonName = uncommonCard.name;
        uncommonPrice = convertCurrency(uncommonCard.prices.usd);

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

        var uncommonPrice = Number(uncommonCard.prices.usd);
        if (currencyMode == "CAD") {
            uncommonPrice = Number(fx(uncommonPrice).from("USD").to("CAD"));
        } else {
        }

        //  Create Uncommon Sum Element
        uncommonSum = uncommonSum + uncommonPrice;

        //  Push price to price array
        myPrices.push(uncommonPrice);
    }

    const uncommonSumElement = document.getElementById("uncommon-sum");
    uncommonSumElement.innerText = uncommonSum;

    // Set Sum on page, clear value.
    uncommonSumElement.innerText = "$" + uncommonSum.toFixed(2);
    uncommonSum = 0;
}

async function rarePull_MH3() {
    //Rare roll
    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    // Random number between 0 and 100
    rareRoll = getRandomNumber(0, 100);
    var rareLink = "";

    // Override roll
    // rareRoll = 91;

    if (rareRoll <= 79.8) {
        rareType = "Normal Rare";
        // rarity:r (is:first-printing OR is:fetchland)
        rareLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+%28game%3Apaper%29+rarity%3Ar+%28is%3Afirst-printing+OR+is%3Afetchland%29";
    } else if (rareRoll <= 92.8) {
        // Mythics include DFC Planeswalkers
        // rarity:m  is:first-printing
        rareLink = "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+rarity%3Am+is%3Afirst-printing";
        rareType = "Mythic Rare";
    } else if (rareRoll <= 94.9) {
        // Retro frames include 24 Rares, 8 Mythics
        // (rarity:r OR rarity:m) frame:old
        rareLink = "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+%28rarity%3Ar+OR+rarity%3Am%29+frame%3Aold";
        rareType = "Retro Frame";
    } else {
        // Borderless, fetch lands, concept Eldrazi, DFC planeswalkers, frame break, profile, other borderless rares or mythic rares.
        //  (rarity:r OR rarity:m) (frame:extendedart OR is:concept OR type:planeswalker OR border:borderless)
        rareLink =
            "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+%28rarity%3Ar+OR+rarity%3Am%29+%28frame%3Aextendedart+OR+is%3Aconcept+OR+type%3Aplaneswalker+OR+border%3Aborderless%29";
        rareType = "Booster Fun";
    }

    let response = await fetch(rareLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    rareName = card.name;
    rarePrice = convertCurrency(card.prices.usd);

    // TO FIX: figure out if DFC....
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        rareImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        rareImagePrimary = card.image_uris.normal;
    }

    //   Replace Img Source
    rareImageElement = document.getElementById("rare-image");

    //  When Rare Image has loaded...Flip and wait accordingly
    const rareStack = document.getElementById("rare-image").parentElement;
    rareImageElement.addEventListener("load", cardImageLoaded(rareImageElement, rareImagePrimary, rareStack));

    //  Insert Price
    const rarePriceElement = document.getElementById("rare-price");
    rarePriceElement.innerText = USDollar.format(rarePrice);
    console.log("rare price: " + rarePrice);

    //  Insert Roll
    const rareRollElement = document.getElementById("rare-roll");
    rareRollElement.innerText = "Roll: " + rareRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(rarePrice);
}

async function newModernPull_MH3() {
    //  New-to-Modern roll
    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    // Random number between 0 and 100
    newModernRoll = getRandomNumber(0, 100);
    var newModernLink = "";

    // Override roll
    // newModernRoll = 99;

    if (newModernRoll <= 75.0) {
        newModernType = "Uncommon New-to-Modern";
        // Uncommon, New-to-Modern (75%)
        // rarity:u, not:firstprinting
        newModernLink = "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+rarity%3Au+not%3Afirstprinting";
    } else if (newModernRoll <= 96.3) {
        // Rare, New-to-Modern (21.3%)
        // rarity:u, not:firstprinting
        newModernLink = "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+rarity%3Ar++not%3Afirstprinting+-type%3Aland";
        newModernType = "Rare New-to-Modern";
    } else if (newModernRoll <= 98.6) {
        // Mythic, New-to-Modern (2.3%)
        // rarity:m not:firstprinting
        newModernLink = "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+rarity%3Am+not%3Afirstprinting";
        newModernType = "Mythic, New-to-Modern";
    } else if (newModernRoll <= 99.4) {
        // NO DATA? Medallions, Orim's Chant, and Kaalia. Exclude K'rrik, Laelia, Breya
        //
        newModernLink =
            'https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+%28rarity%3Ar+OR+rarity%3Am%29+-type%3Aland+not%3Afirstprinting+is%3Aborderless+-"breya"+-"k%27rrik"+-"laelia"';
        newModernType = "Rare or Mythic, New-to-Modern Frame Break";
    } else if (newModernRoll <= 99.7) {
        // NO DATA? Breya, Kaalia, K'rrik, Laeli
        //  (rarity:r OR rarity:m) not:firstprinting is:borderless (type:legendary AND type:creature)
        newModernLink =
            "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+%28rarity%3Ar+OR+rarity%3Am%29+not%3Afirstprinting+is%3Aborderless+%28type%3Alegendary+AND+type%3Acreature%29";
        newModernType = "Rare or Mythic, New-to-Modern Borderless Profile";
    } else if (newModernRoll <= 99.9) {
        //  HARD DATA: Rare or Mythic Retro Frame, but NOT Flusterstorm
        //  (rarity:r OR rarity:m) -type:land not:firstprinting frame:old -"flusterstorm"
        newModernLink =
            'https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+%28rarity%3Ar+OR+rarity%3Am%29+-type%3Aland+not%3Afirstprinting+frame%3Aold+-"flusterstorm"';
        newModernType = "Rare or Mythic, New-to-Modern Retro Frame";
    } else {
        // Mythic Retro Frame (just Recruiter of the Guard)
        //  rarity:m not:firstprinting frame:old
        newModernLink = "https://api.scryfall.com/cards/random?q=%28game%3Apaper%29+set%3Amh3+rarity%3Am+not%3Afirstprinting+frame%3Aold";
        newModernType = "Mythic New-to-Modern Borderless";
    }

    let response = await fetch(newModernLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    newModernName = card.name;
    newModernPrice = convertCurrency(card.prices.usd);

    // TO FIX: figure out if DFC....
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        newModernImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        newModernImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    newModernImageElement = document.getElementById("new-modern-image");

    //  When New Modern Image has loaded...Flip and wait accordingly
    const newModernStack = document.getElementById("new-modern-image").parentElement;
    newModernImageElement.addEventListener("load", cardImageLoaded(newModernImageElement, newModernImagePrimary, newModernStack));

    //  Insert Price
    const newModernPriceElement = document.getElementById("new-modern-price");
    newModernPriceElement.innerText = USDollar.format(newModernPrice);

    //  Insert Roll
    const newModernRollElement = document.getElementById("new-modern-roll");
    newModernRollElement.innerText = "Roll: " + newModernRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(newModernPrice);
}

async function wildcardPull_MH3() {
    rollForWildcard();

    let response = await fetch(wildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    wildcardName = card.name;
    wildcardPrice = convertCurrency(card.prices.usd);

    //  Replace Img Source
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        wildcardImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        wildcardImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    wildcardImageElement = document.getElementById("wildcard-image");

    //  When Wildcard Image has loaded...Flip and wait accordingly
    const wildcardStack = document.getElementById("wildcard-image").parentElement;
    wildcardImageElement.addEventListener("load", cardImageLoaded(wildcardImageElement, wildcardImagePrimary, wildcardStack));

    //  Insert Price
    const wildcardPriceElement = document.getElementById("wildcard-price");
    wildcardPriceElement.innerText = USDollar.format(wildcardPrice);

    //  Insert Roll
    const wildcardRollElement = document.getElementById("wildcard-roll");
    wildcardRollElement.innerText = "Roll: " + wildcardRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(wildcardPrice);
}

async function foilPull_MH3() {
    //  Foil roll
    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    // Random number between 0 and 100
    foilRoll = getRandomNumber(0, 100);

    var foilLink = "";

    // Override roll
    foilRoll = 100;

    let foilType = "unknown";
    if (foilRoll <= 43) {
        // 43 card
        // rarity:c, is:firstprinting
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+not%3Afirstprinting+-type%3Abasic+not%3Afetchland";
        foilType = "Foil New-to-Modern";
    } else if (foilRoll <= 51) {
        // 8 cards
        // not:firstprinting (-type:basic and not:fetchland) frame:old
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+not%3Afirstprinting+(-type%3Abasic+and+not%3Afetchland)+frame%3Aold";
        foilType = "Foil Retro-frame New-to-Modern";
    } else {
        //  362 cards
        //  see logic for Wildcard roll
        rollForWildcard();

        foilLink = wildcardLink;
        foilType = "Foil Wildcard ";
    }

    let response = await fetch(wildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    foilName = card.name;
    foilPrice = convertCurrency(card.prices.usd_foil);

    //  Replace Img Source
    if (card.layout == "transform" || card.layout == "modal_dfc") {
        foilImagePrimary = card.card_faces[0].image_uris.normal;
    } else {
        foilImagePrimary = card.image_uris.normal;
    }

    //  Replace Img Source
    foilImageElement = document.getElementById("foil-image");

    //  When Foil Image has loaded...Flip and wait accordingly
    const foilStack = document.getElementById("foil-image").closest(".both-cards");
    foilImageElement.addEventListener("load", cardImageLoaded(foilImageElement, foilImagePrimary, foilStack));

    //  Insert Price
    const foilPriceElement = document.getElementById("foil-price");
    foilPriceElement.innerText = USDollar.format(foilPrice);

    //  Insert Roll
    const foilRollElement = document.getElementById("foil-roll");
    foilRollElement.innerText = "Roll: " + foilRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(foilPrice);
}

async function landcommonPull_MH3() {
    //Rare roll
    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    // Random number between 0 and 100
    landcommonRoll = getRandomNumber(0, 100);
    var landcommonLink = "";

    // Override roll
    // landcommonRoll = 98;

    let landcommonType = "unknown";
    if (landcommonRoll <= 50) {
        // rarity:c is:firstprinting
        landcommonLink = "https://api.scryfall.com/cards/random?q=set%3Amh3+rarity%3Ac+is%3Afirstprinting";
        landcommonType = "Common";
    } else if (landcommonRoll <= 70) {
        // Non-foil basic land
        // type:"basic land" unique:art  not:boosterfun not:fullart
        landcommonLink = 'https://api.scryfall.com/cards/random?q=set%3Amh3+type%3A"basic+land"+unique%3Aart++not%3Afullart+not%3Aboosterfun';
        landcommonType = "Non-foil Land";
    } else if (landcommonRoll <= 83.3) {
        // Foil basic land
        // type:"basic land" unique:art  not:boosterfun not:fullart
        landcommonLink = 'https://api.scryfall.com/cards/random?q=set%3Amh3+type%3A"basic+land"+unique%3Aart++not%3Afullart+not%3Aboosterfun';
        landcommonType = "Foil Land";
    } else if (landcommonRoll <= 93.3) {
        // Non-foil full-art Eldrazi land
        // type:"basic land" unique:art is:foil is:fullart
        landcommonLink = 'https://api.scryfall.com/cards/random?q=set%3Amh3+type%3A"basic+land"+unique%3Aart+is%3Afoil+is%3Afullart';
        landcommonType = "Non-Foil Full-Art Land";
    } else {
        // Foil full-art Edlrazi land
        // type:"basic land" unique:art is:foil is:fullart
        landcommonLink = 'https://api.scryfall.com/cards/random?q=set%3Amh3+type%3A"basic+land"+unique%3Aart+is%3Afoil+is%3Afullart';
        landcommonType = "Foil Full-Art Land";
    }

    let response = await fetch(landcommonLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    landcommonName = card.name;
    console.log(landcommonType);

    var landcommonCard = document.getElementById("landcommon-image").previousElementSibling;
    console.log(landcommonCard);

    // Add foil effect if foil
    if (landcommonType == "Foil Land" || landcommonType == "Foil Full-Art Land") {
        landcommonCard.classList.add("foil-gradient");
    } else {
        landcommonCard.classList.remove("foil-gradient");
    }

    // Set price, foil price if foil
    if (landcommonType == "Foil Land" || landcommonType == "Foil Full-Art Land") {
        landcommonPrice = convertCurrency(card.prices.usd_foil);
    } else {
        landcommonPrice = convertCurrency(card.prices.usd);
    }

    landcommonImagePrimary = card.image_uris.normal;

    //  Replace Img Source
    landcommonImageElement = document.getElementById("landcommon-image");

    //  When Land/Common Image has loaded...Flip and wait accordingly
    const landcommonStack = landcommonImageElement.closest(".both-cards");
    landcommonImageElement.addEventListener("load", cardImageLoaded(landcommonImageElement, landcommonImagePrimary, landcommonStack));

    //  Insert Price
    const landcommonPriceElement = document.getElementById("landcommon-price");
    landcommonPriceElement.innerText = USDollar.format(landcommonPrice);

    //  Insert Roll
    const landcommonRollElement = document.getElementById("landcommon-roll");
    landcommonRollElement.innerText = "Roll: " + landcommonRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(landcommonPrice);
}

function sumTotals_MH3() {
    // Add Boosters Bought
    boostersBought++;
    boosterTotalValue = boostersBought * boosterValue;
    const boostersBoughtElement = document.getElementById("boosters-bought");
    boostersBoughtElement.innerText = boostersBought + (" (" + USDollar.format(boosterTotalValue) + ")");

    function checkIfFinished() {
        return myPrices.length >= 14;
    }

    var timeout = setInterval(function () {
        const loadingOverlay = document.getElementById("data-loading");
        if (checkIfFinished()) {
            console.log("checking if finished");
            clearInterval(timeout);
            isFinished = true;

            loadingOverlay.classList.remove("z-10", "loader-blur-effect");
            loadingOverlay.classList.add("-z-10", "opacity-0");

            const commonSumElement = document.getElementById("common-sum");
            commonSumElement.innerText = "$" + commonSum.toFixed(2);
            commonSum = 0;

            //  Sum up all prices in array
            myPrices.forEach((num) => {
                newTotal += num;
            });
            newTotal = newTotal - boosterValue;
            currentMoneyElement.innerText = "$" + newTotal.toFixed(2);
            currentMoneyElement.classList.add("px-3");

            if (newTotal > 0) {
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
        }
    }, 100);
}
