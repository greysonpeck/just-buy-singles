function setFDN() {
    currentSet = "FDN";
    document.cookie = "currentSet = 'FDN'";
    boosterValue = 8;

    document.getElementById("set-header").innerText = "FOUNDATIONS";
    document.getElementById("set-toggle-1").innerText = "go modern horizons 3";
    document.getElementById("set-toggle-1").addEventListener("click", () => {
        setMH3();
    });
    document.getElementById("set-toggle-2").innerText = "go duskmourn";
    document.getElementById("set-toggle-2").addEventListener("click", () => {
        setDSK();
    });
    document.body.style.backgroundImage = "url(img/FDN_bg.jpg)";
    clearSlots();
    makeFDNSlots();
    clearMoney();
}

function makeFDNSlots() {
    makeSlot("raremythic-1", "Foil Rare/Mythic #1", true);
    makeSlot("raremythic-2", "Foil Rare/Mythic #2", true);
    makeSlot("raremythic-nf-1", "Rare/Mythic #1");
    makeSlot("raremythic-nf-2", "Rare/Mythic #2");
    makeSlot("foil", "Foil Wildcard", true);
    makeSlot("land", "Full-Art Land", true);
    makeSlot("uncommon", "Uncommons", false, 4);
    makeSlot("common", "Commons", false, 5);
    makeSlot("", "", false, -1);
}

function pullFDN() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        ghostPull_FDN();

        commonPull_FDN();

        uncommonPull_FDN();

        rareMythic_FDN();

        nfRareMythic_FDN();

        landPull_FDN();

        foilPull_FDN();

        sumTotals_FDN();
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

function ghostPull_FDN() {
    // Set prices and link
    totalBoosterSpend = (boostersBought + 1) * boosterValue;
    boosterSpendTop = convertToUSD(totalBoosterSpend + totalBoosterSpend * 0.12);
    boosterSpendBottom = convertToUSD(totalBoosterSpend - totalBoosterSpend * 0.12);

    ghostLinkHalf = "https://api.scryfall.com/cards/random?q=set%3Afdn+unique%3Aprints+";
    ghostLinkConstructed = ghostLinkHalf + "USD>%3D" + boosterSpendBottom + "+" + "USD<%3D" + boosterSpendTop;

    topOutLink = "https://api.scryfall.com/cards/search?order=usd&q=set%3Afdn+unique%3Aprints+USD%3E%3D15";

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

async function commonPull_FDN() {
    //  Get card from Scryfall
    for (i = 1; i < 6; i++) {
        //Common roll
        commonRoll = getRandomNumber(0, 100);

        if (commonRoll <= 87) {
            // set:fdn rarity:c (cn<=253 or cn=262)
            commonType = "Main Set Common";
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ac+%28cn<%3D253+or+cn%3D262%29";
        } else if (commonRoll <= 97.9) {
            // set:fdn rarity:c cn>=258 AND cn<=271 AND cn!=262
            commonTye = "Common Dual Lands";
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ac+cn>%3D258+AND+cn<%3D271+AND+cn%21%3D262";
        } else {
            // set:fdn rarity:c border:borderless
            commonType = "Common Borderless";
            commonLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Ac+border%3Aborderless";
        }

        let response = await fetch(commonLink);
        let commonCard = await response.json();

        commonName = commonCard.name;
        commonPrice = convertCurrency(commonCard.prices.usd);

        //  Set img source
        commonImage = commonCard.image_uris.normal;

        var commonImageId = "common-image-" + i;
        commonImageElement = document.getElementById(commonImageId);
        commonImageElement.src = commonImage;

        //  When card has loaded...Flip and wait accordingly
        const commonStack = document.getElementById("common-image-" + i).parentElement;
        commonImageElement.addEventListener("load", cardImageLoaded(commonImageElement, commonImage, commonStack));

        var commonPrice = Number(commonCard.prices.usd);
        if (currencyMode == "CAD") {
            commonPrice = Number(fx(commonPrice).from("USD").to("CAD"));
        } else {
        }

        //  Create Common Sum Element
        commonSum = commonSum + commonPrice;
        console.log(commonSum);

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
    // while (uncommonSet.firstChild) {
    //   uncommonSet.removeChild(uncommonSet.lastChild);
    // }
    //  Get card from Scryfall
    for (j = 1; j < 5; j++) {
        // set:fdn rarity:u (is:booster OR border:borderless)
        let response = await fetch("https://api.scryfall.com/cards/random?q=set%3Afdn+rarity%3Au+%28is%3Abooster+OR+border%3Aborderless%29");
        let uncommonCard = await response.json();
        uncommonName = uncommonCard.name;
        uncommonPrice = convertCurrency(uncommonCard.prices.usd);

        //  Replace Img Source, check for DFC
        uncommonImage = uncommonCard.image_uris.normal;

        var uncommonImageId = "uncommon-image-" + j;
        uncommonImageElement = document.getElementById(uncommonImageId);
        uncommonImageElement.src = uncommonImage;

        //  When card has loaded...Flip and wait accordingly
        const uncommonStack = document.getElementById("uncommon-image-" + j).parentElement;
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

async function rareMythic_FDN() {
    for (k = 1; k < 3; k++) {
        // Random number between 0 and 100
        rareMythicRoll = getRandomNumber(0, 100);
        var rareMythicLink = "";

        // Override roll
        // rareRoll = 94.9;

        if (rareMythicRoll <= 85.7) {
            // Rare, normal border
            // set:fdn is:booster rarity:r
            rareMythicType = "Rare - normal border";
            rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Abooster+rarity%3Ar";
        } else {
            // Mythic, normal border
            // set:fdn is:booster rarity:m
            rareMythicType = "Mythic - normal border";
            rareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Abooster+rarity%3Am";
        }

        let response = await fetch(rareMythicLink);

        // waits until Scryfall fetch completes...
        let card = await response.json();
        rareMythicName = card.name;
        rareMythicPrice = convertCurrency(card.prices.usd_foil);

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

        if (nfRareMythicRoll <= 85.7) {
            // Rare, normal border
            // set:fdn is:booster rarity:r
            nfRareMythicType = "Rare - normal border";
            nfRareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Abooster+rarity%3Ar";
        } else {
            // Mythic, normal border
            // set:fdn is:booster rarity:m
            nfRareMythicType = "Mythic - normal border";
            nfRareMythicLink = "https://api.scryfall.com/cards/random?q=set%3Afdn+is%3Abooster+rarity%3Am";
        }

        let response = await fetch(nfRareMythicLink);

        // waits until Scryfall fetch completes...
        let card = await response.json();
        nfRareMythicName = card.name;
        nfRareMythicPrice = convertCurrency(card.prices.usd_foil);

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
    // foilRoll = 94.9;

    if (foilRoll <= 91.7) {
        // Foil Common or Uncommon, inc. Booster Fun, inc. Terramorphic Expanse
        // (rarity:c OR rarity:u) unique:art (-type:land or name:"Terramorphic Expanse")
        foilType = "Common or Uncommon";
        foilLink =
            "https://api.scryfall.com/cards/random?q=set%3Adsk+%28rarity%3Ac+OR+rarity%3Au%29+unique%3Aart+%28-type%3Aland+or+name%3A'Terramorphic+Expanse'%29";
    } else {
        // Rare or Mythic, inc. Booster Fun, excl. Lands
        // (rarity:r or rarity:m) -type:land unique:art collectornumber<386
        // THIS ONE IS WRONG, INCLUDES COLLECTOR BOOSTER STUFF
        foilType = "Rare or Mythic, may include Booster Fun";
        foilLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+%28rarity%3Ar+or+rarity%3Am%29+-type%3Aland+unique%3Aart+collectornumber<386";
    }

    let response = await fetch(foilLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    foilName = card.name;
    foilPrice = convertCurrency(card.prices.usd_foil);

    // Replace Img Source
    foilImagePrimary = card.image_uris.normal;
    foilImageElement = document.getElementById("foil-image");
    foilImageElement.src = foilImagePrimary;

    //  When card has loaded...Flip and wait accordingly
    let foilStack = foilImageElement.parentElement;
    foilStack = document.getElementById("foil-image").closest(".both-cards");
    console.log(foilStack);
    foilImageElement.addEventListener("load", cardImageLoaded(foilImageElement, foilImagePrimary, foilStack));

    //  Add foil effect
    // var foilCard = document.getElementById("foil-card");
    // foilCard.firstElementChild.classList.add("foil-gradient");

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
    landType = "Full-art basic";

    let response = await fetch(landLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    landName = card.name;

    var landImageElement = document.getElementById("land-image").previousElementSibling;

    // Add foil effect if foil
    if (landType == "Foil Land" || landType == "Foil Full-Art Land") {
        landImageElement.classList.add("foil-gradient");
    } else {
        landImageElement.classList.remove("foil-gradient");
    }

    // Set price, foil price if foil
    landPrice = Number(card.prices.usd_foil);

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

function sumTotals_FDN() {
    // Add Boosters Bought
    boostersBought++;
    boosterTotalValue = boostersBought * boosterValue;
    const boostersBoughtElement = document.getElementById("boosters-bought");
    boostersBoughtElement.innerText = boostersBought + (" (" + USDollar.format(boosterTotalValue) + ")");

    function checkIfFinished() {
        return myPrices.length >= 15;
    }

    var timeout = setInterval(function () {
        const loadingOverlay = document.getElementById("data-loading");
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
        }
    }, 100);
}
