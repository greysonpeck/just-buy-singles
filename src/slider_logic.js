window.onload = function () {
    const soundSVG = `<path d="M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm11.008 2.093c.742.743 1.2 1.77 1.198 2.903-.002 1.133-.462 2.158-1.205 2.9l1.219 1.223c1.057-1.053 1.712-2.511 1.715-4.121.002-1.611-.648-3.068-1.702-4.125l-1.225 1.22zm2.142-2.135c1.288 1.292 2.082 3.073 2.079 5.041s-.804 3.75-2.096 5.039l1.25 1.254c1.612-1.608 2.613-3.834 2.616-6.291.005-2.457-.986-4.681-2.595-6.293l-1.254 1.25z"/>`;
    const muteSVG = `<path d="M5 17h-5v-10h5v10zm2-10v10l9 5v-20l-9 5zm15.324 4.993l1.646-1.659-1.324-1.324-1.651 1.67-1.665-1.648-1.316 1.318 1.67 1.657-1.65 1.669 1.318 1.317 1.658-1.672 1.666 1.653 1.324-1.325-1.676-1.656z"/>`;

    const root = document.querySelector(":root");
    const volume = document.querySelector("#volume");
    const slider = document.querySelector("#sound-slider");
    const sliderContainer = document.querySelector("#sound-slider__container");
    const loadingOverlay = document.getElementById("data-loading");
    let isLocked = false;

    // Unlock when user releases the mouse
    slider.addEventListener("mouseup", () => {
        // volume.innerHTML = 5;
        isLocked = false;
    });

    // Also unlock for touch devices
    slider.addEventListener("touchend", () => {
        isLocked = false;
    });

    function handleRangeUpdate(el) {
        if (el.target) {
            el = el.target;
        }
        volume.innerHTML = el.value;
        root.style.setProperty("--percentage", `${(el.value * 100) / (el.max - el.min)}%`);

        if (volume.innerHTML >= 97 && !isLocked) {
            isLocked = true;
            loadingOverlay.classList.remove("-z-10", "opacity-0");
            loadingOverlay.classList.add("z-10", "loader-blur-effect");
            setTimeout(function () {
                pullBooster();
            }, 700);
        }
    }

    handleRangeUpdate(slider);

    //toggle the volume
    // let lastVolume = 30;
    // function toggleMute() {
    //     if (slider.value > 0) {
    //         lastVolume = slider.value;
    //         slider.value = 0;
    //         handleRangeUpdate(slider);
    //     } else {
    //         slider.value = lastVolume;
    //         handleRangeUpdate(slider);
    //     }
    // }

    slider.addEventListener("input", handleRangeUpdate);

    /* inspired by https://codepen.io/Hyperplexed/pen/MWQeYLW */
    sliderContainer.onmousemove = (e) => {
        const rect = sliderContainer.getBoundingClientRect(),
            x = e.clientX - rect.left,
            y = e.clientY - rect.top;

        sliderContainer.style.setProperty("--mouse-x", `${x}px`);
        sliderContainer.style.setProperty("--mouse-y", `${y}px`);
    };
};
