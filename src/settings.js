document.addEventListener("DOMContentLoaded", () => {
    const editPrice = document.getElementById("edit-price");
    const boosterPriceElement = document.getElementById("pricePerBooster");
    const priceModal = document.getElementById("price-modal-container");
    const currentPrice = document.getElementById("pricePerBooster");
    const modalPrice = document.getElementById("modal-price");
    const priceUp = document.getElementById("price-up");
    const priceDown = document.getElementById("price-down");
    const lightShade = document.querySelector(".light-shade");

    activePriceModal = false;
    // modalPrice.innerText = USDollar.format(boosterValue);

    currentPrice.innerText = USDollar.format(boosterValue);

    // modalPrice.innerText = USDollar.format(boosterValue);

    // Initialize?
    let currentSet = getCookie("currentSet").replaceAll("'", "");

    function priceChange() {
        currentSet = getCookie("currentSet").replaceAll("'", "");
        if (currencyMode === "CAD") {
            currentPrice.innerText = USDollar.format(boosterValue);
            // modalPrice.innerText = USDollar.format(boosterValue);
            if (getCookie("currentBoosterType") === "PLAY") {
                document.cookie = "boosterValue_CAD_" + currentSet + "_PLAY=" + boosterValue;
            } else {
                document.cookie = "boosterValue_CAD_" + currentSet + "=" + boosterValue;
            }
            CAD_boosterValue = boosterValue;
        } else {
            currentPrice.innerText = USDollar.format(boosterValue);
            // modalPrice.innerText = USDollar.format(boosterValue);
            if (getCookie("currentBoosterType") === "PLAY") {
                document.cookie = "boosterValue_" + currentSet + "_PLAY=" + boosterValue;
            } else {
                document.cookie = "boosterValue_" + currentSet + "=" + boosterValue;
            }
        }
    }

    if (currencyMode === "CAD") {
        // if we have the cookie "boosterprice_CAN_[your set here]"
        if (getCookie("boosterValue_CAD_" + currentSet)) {
            // console.log("wow, we have it (CAD)");
        } else {
            // console.log("no, we do not have it (CAD)");
        }
    } else {
        if (getCookie("boosterValue_" + currentSet)) {
            // console.log("wow, we have it (USD)");
        } else {
            // console.log("no, we do not have it (USD)");
        }
    }

    // Click booster price, get modal
    // editPrice.addEventListener("click", function (event) {
    //     if (event.target == currentPrice) {
    //         umamiAnalytics("Price change open");
    //     }

    //     modalPrice.innerText = USDollar.format(boosterValue);

    //     priceModal.classList.remove("hidden");
    //     lightShade.classList.remove("opacity-0", "-z-10");
    //     activePriceModal = true;
    // });

    // // Click booster price up
    // priceUp.addEventListener("click", function () {
    //     if (boosterValue < 245) {
    //         boosterValue = Number(boosterValue) + 1;
    //         priceChange();
    //     } else {
    //         // be for real
    //     }
    // });

    // // Click booster price up
    // priceDown.addEventListener("click", function () {
    //     if (boosterValue > 5) {
    //         boosterValue = Number(boosterValue) - 1;
    //         priceChange();
    //     } else {
    //         // be for real
    //     }
    // });

    // document.addEventListener("click", function (event) {
    //     if (!activePriceModal) return;
    //     if (!priceModal.contains(event.target) && event.target !== editPrice && event.target !== currentPrice) {
    //         priceModal.classList.add("hidden");
    //         lightShade.classList.add("opacity-0", "-z-10");
    //     }
    // });

    // document.addEventListener("keydown", (event) => {
    //     if (activePriceModal && event.key === "Escape") {
    //         priceModal.classList.add("hidden");
    //         lightShade.classList.add("opacity-0", "-z-10");

    //         activePriceModal = false;
    //     }
    // });







    // new price stuff

    const editBtn = document.getElementById('edit-price');
    const valueSpan = document.getElementById('pricePerBooster');

    function openModal() {
    const currentValue = Number(currentPrice.textContent.replace(/[^0-9.]/g, ''));

    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 flex items-center justify-center bg-slate-500/25 z-50';
    backdrop.setAttribute('role', 'dialog');
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeModal(); });

    const panel = document.createElement('div');
    panel.className = 'relative -top-[20%] jbs-background mx-auto p-4 pb-4 w-[250px] bg-emerald-800 rounded-lg shadow-2xl ring-2 ring-white/80 ';
    panel.innerHTML = `
        <div class="flex">
      <span class="text-xl h-[46px] bg-zinc-700 py-6 px-4 ring-1 ring-white flex items-center justify-center rounded-l-sm">$</span>
      <input id="modalInput" type="text" inputmode="decimal" autocomplete="off" maxlength="5" class="text-zinc-800" type="text" inputmode="numeric" pattern="\\d*" value="${currentValue}"
             class="border rounded px-3 py-2 w-full mb-4" />
    </div>
      <div class="flex justify-end gap-2">
        <button id="cancelBtn" class="px-3 py-2 rounded  bg-none hover:underline cursor-pointer">Cancel</button>
        <button id="saveBtn" class="px-3 py-2 rounded ring-1 ring-white bg-zinc-800 text-white hover:bg-zinc-900 cursor-pointer">Save</button>
      </div>
    `;

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    const input = panel.querySelector('#modalInput');
    const saveBtn = panel.querySelector('#saveBtn');
    const cancelBtn = panel.querySelector('#cancelBtn');
    
    // Style input
    input.className = "h-12 font-bold text-3xl p-2 mb-2 bg-white rounded-r-md outline-1 outline-white w-full text-zinc-800";

    // Restrict input to digits only
    function sanitizePrice(value) {
  // remove anything that's not a digit or dot
  value = value.replace(/[^0-9.]/g, '');

  // keep only the first dot
  const firstDotIndex = value.indexOf('.');
  if (firstDotIndex !== -1) {
    // split into before/after first dot
    const beforeDot = value.slice(0, firstDotIndex + 1); // includes first dot
    const afterDot = value.slice(firstDotIndex + 1).replace(/\./g, ''); // remove extra dots
    value = beforeDot + afterDot;
  }

  return value;
}

input.addEventListener('input', () => {
  input.value = sanitizePrice(input.value);
});


    function closeModal() {
      backdrop.remove();
    }

    cancelBtn.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', () => {
      if (input.value.trim() === '') {
        // If empty, do not change the span; just close
        closeModal();
        return;
      }

      // Chopping cents off
    //   const intVal = parseInt(input.value, 10);
    //   if (!Number.isNaN(intVal) && valueSpan) valueSpan.textContent = Number(intVal).toFixed(2);

    //     console.log("first, currentPrice is: ",  Number(intVal).toFixed(2))
        // boosterValue = Number(intVal).toFixed(2);
        boosterValue = input.value.trim();


      priceChange();
      closeModal();
    });

    // Autofocus input
    input.focus();
    input.select();
  }

  if (editBtn) editBtn.addEventListener('click', openModal);
});


