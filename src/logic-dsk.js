function setDSK() {
    currentSet = "DSK";
    document.cookie = "currentSet = 'DSK'";

    document.getElementById("set-header").innerText = "DUSKMOURN";
    document.getElementById("set-toggle-1").innerText = "go foundations";
    document.getElementById("set-toggle-1").addEventListener("click", () => {
        setFDN();
    });
    document.getElementById("set-toggle-2").innerText = "go modern horizons 3";
    document.getElementById("set-toggle-2").addEventListener("click", () => {
        setMH3();
    });
    document.body.style.backgroundImage = "url(img/DSK_bg.jpg)";
    clearSlots();
    makeDSKSlots();
    clearMoney();
}

function makeDSKSlots() {
    makeSlot("rare", "Rare or Mythic");
    makeSlot("wildcard", "Wildcard");
    makeSlot("foil", "Foil Wildcard", true);
    makeSlot("land", "Land or Common", true);
    makeSlot("uncommon", "Uncommons", false, 3);
    makeSlot("common", "Commons", false, 6);
    makeSlot("", "", false, -1);
}

function pullDSK() {
    // Prevent slider from triggering pulls multiple times
    if (activeCheck == false) {
        activeCheck = true;

        // Reset the slider
        const slider = document.querySelector("#sound-slider");
        slider.value = 10;

        ghostPull();

        commonPull();

        uncommonPull();

        rarePull_DSK();

        landPull();

        wildcardPull_DSK();

        foilPull();

        sumTotals_DSK();
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

function ghostPull() {
    // Set prices and link
    totalBoosterSpend = (boostersBought + 1) * boosterValue;
    boosterSpendTop = convertToUSD(totalBoosterSpend + totalBoosterSpend * 0.12);
    boosterSpendBottom = convertToUSD(totalBoosterSpend - totalBoosterSpend * 0.12);

    ghostLinkHalf = "https://api.scryfall.com/cards/random?q=set%3Adsk+unique%3Aprints+";
    ghostLinkConstructed = ghostLinkHalf + "USD>%3D" + boosterSpendBottom + "+" + "USD<%3D" + boosterSpendTop;

    topOutLink = "https://api.scryfall.com/cards/search?order=usd&q=set%3Adsk+unique%3Aprints+USD%3E%3D15";

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

//   New commons function
async function commonPull() {
    //  Get card from Scryfall
    for (j = 1; j < 7; j++) {
        // If we hit on SPG roll...
        commonSPGRollRaw = getRandomNumber(1, 64);
        commonSPGRoll = Math.round(commonSPGRollRaw);
        // Override roll
        // commonSPGRoll = 64;

        for (j = 1; j < 7; j++) {
            if (commonSPGRoll === 64 && j === 6) {
                // Special Guest, set:spg date:2024-09-27
                commonType = "Special Guest";
                commonSPGLink = "https://api.scryfall.com/cards/random?q=set%3Aspg+date%3A2024-09-27+%28game%3Apaper%29";
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
                // Common, 81 cards. There are two commons that have Lurking Evil variants, appearing 25% of the time.
                // rarity:c (-type:land OR name:"Terramorphic Expanse")
                // No dual lands, but include Terramorphic Expanse
                let response = await fetch(
                    "https://api.scryfall.com/cards/random?q=set%3Adsk+rarity%3Ac+%28-type%3Aland+OR+name%3A'Terramorphic+Expanse'%29&unique=cards&as=checklist&order=name&dir=asc"
                );
                let commonCard = await response.json();
                commonName = commonCard.name;
                commonPrice = convertCurrency(commonCard.prices.usd);

                //  Set img source
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
        }
        const commonSumElement = document.getElementById("common-sum");
        commonSumElement.innerText = commonSum;

        // Set Sum on page, clear value.
        commonSumElement.innerText = "$" + commonSum.toFixed(2);
        // commonSum = 0;
    }
}

async function uncommonPull() {
    // Clear out all uncommon card divs, if they exist
    uncommonSet = document.getElementById("uncommon-set");
    // while (uncommonSet.firstChild) {
    //   uncommonSet.removeChild(uncommonSet.lastChild);
    // }
    //  Get card from Scryfall
    for (k = 1; k < 4; k++) {
        let response = await fetch("https://api.scryfall.com/cards/random?q=set%3Adsk+%28game%3Apaper%29+rarity%3Au");
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

async function rarePull_DSK() {
    //Rare roll
    const getRandomNumber = (min, max) => {
        return Math.random() * (max - min) + min;
    };
    // Random number between 0 and 100
    rareRoll = getRandomNumber(0, 100);
    var rareLink = "";

    // Override roll
    // rareRoll = 94.9;

    if (rareRoll <= 75) {
        // Rare
        // rarity:r -is:boosterfun
        rareType = "Rare";
        rareLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+rarity%3Ar+-is%3Aboosterfun";
    } else if (rareRoll <= 87.6) {
        // Mythic
        // rarity:m -is:boosterfun
        rareType = "Mythic";
        rareLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+rarity%3Am+-is%3Aboosterfun";
    } else if (rareRoll <= 95.8) {
        // Rare Booster Fun (59 cards, quoted 46)
        // rarity:r is:boosterfun collectornumber<386
        // Exclude Japan Showcase, Double Exposure Textured Foil, Promos
        // INCLUDES Endurings, Leylines, Overlords, which also show up in borderless. These are reduced % in the packs, but show up higher than average here.
        rareType = "Rare - Booster Fun";
        rareLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+rarity%3Ar+is%3Aboosterfun+collectornumber<386";
    } else if (rareRoll <= 97.2) {
        // Mythic Booster Fun (20 cards, quoted 16)
        // rarity:m is:boosterfun
        rareType = "Mythic - Booster Fun";
        rareLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+%28game%3Apaper%29+rarity%3Am+is%3Aboosterfun";
    } else if (rareRoll <= 99.7) {
        // Rare Lurking Evil (7 cards)
        // set:dsk (collectornumber=289 OR collectornumber=290  OR collectornumber=292  OR collectornumber=294 OR collectornumber=296 OR collectornumber=299 OR collectornumber=301)
        rareType = "Rare - Lurking Evil";
        rareLink =
            "https://api.scryfall.com/cards/random?q=set%3Adsk+%28collectornumber%3D289+OR+collectornumber%3D290++OR+collectornumber%3D292++OR+collectornumber%3D294+OR+collectornumber%3D296+OR+collectornumber%3D299+OR+collectornumber%3D301%29";
    } else {
        // Mythic Lurking Evil (2 cards)
        // set:dsk (collectornumber=293 or collectornumber=298)
        rareType = "Mythic - Lurking Evil";
        rareLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+%28collectornumber%3D293+or+collectornumber%3D298%29";
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
    document.getElementById("rare-image").src = rareImagePrimary;

    //  Insert Price
    const rarePriceElement = document.getElementById("rare-price");
    rarePriceElement.innerText = USDollar.format(rarePrice);

    //  Insert Roll
    const rareRollElement = document.getElementById("rare-roll");
    rareRollElement.innerText = "Roll: " + rareRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(rarePrice);
}

async function wildcardPull_DSK() {
    // Random number between 0 and 100
    wildcardRoll = getRandomNumber(0, 100);
    var wildcardLink = "";

    // Override roll
    // wildcardRoll = 94.9;

    if (wildcardRoll <= 91.7) {
        // Wildcard Common or Uncommon, inc. Booster Fun, inc. Terramorphic Expanse
        // (rarity:c OR rarity:u) unique:art (-type:land or name:"Terramorphic Expanse")
        wildcardType = "Common or Uncommon";
        wildcardLink =
            "https://api.scryfall.com/cards/random?q=set%3Adsk+%28rarity%3Ac+OR+rarity%3Au%29+unique%3Aart+%28-type%3Aland+or+name%3A'Terramorphic+Expanse'%29";
    } else {
        // Rare or Mythic, inc. Booster Fun, excl. Lands
        // (rarity:r or rarity:m) -type:land unique:art collectornumber<386
        // THIS ONE IS WRONG, INCLUDES COLLECTOR BOOSTER STUFF
        wildcardType = "Rare or Mythic, may include Booster Fun";
        wildcardLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+%28rarity%3Ar+or+rarity%3Am%29+-type%3Aland+unique%3Aart+collectornumber<386";
    }

    let response = await fetch(wildcardLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    wildcardName = card.name;
    wildcardPrice = convertCurrency(card.prices.usd);

    wildcardImagePrimary = card.image_uris.normal;

    //   Replace Img Source
    document.getElementById("wildcard-image").src = wildcardImagePrimary;

    //  Insert Price
    const wildcardPriceElement = document.getElementById("wildcard-price");
    wildcardPriceElement.innerText = USDollar.format(wildcardPrice);

    //  Insert Roll
    const wildcardRollElement = document.getElementById("wildcard-roll");
    wildcardRollElement.innerText = "Roll: " + wildcardRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(wildcardPrice);
}

async function foilPull() {
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
    console.log(card);
    foilName = card.name;
    foilPrice = convertCurrency(card.prices.usd_foil);

    // Replace Img Source
    foilImagePrimary = card.image_uris.normal;
    document.getElementById("foil-image").src = foilImagePrimary;

    //  Add foil effect
    var foilCard = document.getElementById("foil-card");
    foilCard.firstElementChild.classList.add("foil-gradient");

    //  Insert Price
    const foilPriceElement = document.getElementById("foil-price");
    foilPriceElement.innerText = USDollar.format(foilPrice);

    //  Insert Roll
    const foilRollElement = document.getElementById("foil-roll");
    foilRollElement.innerText = "Roll: " + foilRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(foilPrice);
}

async function landPull() {
    // Random number between 0 and 100
    landRoll = getRandomNumber(0, 100);
    var landLink = "";

    // Override roll
    // landRoll = 98;

    let landType = "unknown";
    if (landRoll <= 13.3) {
        // Non-foil full-art land
        // type:basic is:fullart
        landLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+type%3Abasic+is%3Afullart";
        landType = "Full-art basic";
    } else if (landRoll <= 16.6) {
        // Foil full-art land
        // type:basic is:fullart
        // NEEDS FOIL TREATMENT
        landLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+type%3Abasic+is%3Afullart";
        landType = "Foil full-art basic";
    } else if (landRoll <= 43.3) {
        // Basic land
        //  type:basic unique:art -is:fullart
        landLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+type%3Abasic+unique%3Aart+-is%3Afullart";
        landType = "Non-foil Basic";
    } else if (landRoll <= 50) {
        // Foil basic land
        // type:basic unique:art -is:fullart
        landLink = "https://api.scryfall.com/cards/random?q=set%3Adsk+type%3Abasic+unique%3Aart+-is%3Afullart";
        landType = "Foil Basic";
    } else if (landRoll <= 90) {
        // Common dual-land
        // rarity:c type:land -type:basic -name:"Terramorphic Expanse"
        landLink = 'https://api.scryfall.com/cards/random?q=set%3Adsk+type%3Aland+rarity%3Ac+-type%3Abasic+-name%3A"Terramorphic+Expanse"';
        landType = "Common Dual";
    } else {
        // Foil full-art Edlrazi land
        // type:"basic land" unique:art is:foil is:fullart
        landLink = 'https://api.scryfall.com/cards/random?q=set%3Adsk+type%3Aland+rarity%3Ac+-type%3Abasic+-name%3A"Terramorphic+Expanse"';
        landType = "Foil Common Dual";
    }

    let response = await fetch(landLink);

    // waits until Scryfall fetch completes...
    let card = await response.json();
    landName = card.name;

    var landCard = document.getElementById("land-card");

    // Add foil effect if foil
    if (landType == "Foil full-art basic" || landType == "Foil Basic" || landType == "Foil Common Dual") {
        landCard.firstElementChild.classList.add("foil-gradient");
    } else {
        landCard.firstElementChild.classList.remove("foil-gradient");
    }

    // Set price, foil price if foil
    if (landType == "Foil full-art basic" || landType == "Foil Basic" || landType == "Foil Common Dual") {
        landPrice = Number(card.prices.usd_foil);
    } else {
        landPrice = Number(card.prices.usd);
    }

    landImagePrimary = card.image_uris.normal;

    //   Replace Img Source
    document.getElementById("land-image").src = landImagePrimary;

    //  Insert Price
    const landPriceElement = document.getElementById("land-price");
    landPriceElement.innerText = USDollar.format(landPrice);

    //  Insert Roll
    const landRollElement = document.getElementById("land-roll");
    landRollElement.innerText = "Roll: " + landRoll.toFixed(0);

    //  Push price to price array
    myPrices.push(landPrice);
}

function sumTotals_DSK() {
    // Add Boosters Bought
    boostersBought++;
    boosterTotalValue = boostersBought * boosterValue;
    const boostersBoughtElement = document.getElementById("boosters-bought");
    boostersBoughtElement.innerText = boostersBought + (" (" + USDollar.format(boosterTotalValue) + ")");

    function checkIfFinished() {
        return myPrices.length >= 13;
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
