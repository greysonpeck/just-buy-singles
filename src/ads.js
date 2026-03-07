// document.addEventListener("DOMContentLoaded", () => {
//     function loadFooterAd() {
//         const adHolder = document.getElementById("ad-holder-footer");
//         adHolder.innerHTML = ""; // clear old ad
//         adHolder.style.display = "flex";

//         const ad = document.createElement("ins");
//         ad.className = "adsbygoogle flex justify-center";
//         ad.style.display = "flex";
//         ad.setAttribute("data-ad-client", "ca-pub-1084747507972985");
//         ad.setAttribute("data-ad-slot", "1234567890");
//         ad.setAttribute("data-ad-format", "auto");
//         ad.setAttribute("data-full-width-responsive", "true");

//         adHolder.appendChild(ad);

//         // Wait until layout is calculated
//         requestAnimationFrame(() => {
//             requestAnimationFrame(() => {
//                 (adsbygoogle = window.adsbygoogle || []).push({});
//             });
//         });
//     }

//     // Example: call loadFooterAd only after consent
//     const consent = localStorage.getItem("adConsent");
//     if (consent === "granted") {
//         loadFooterAd();
//     }
// });
