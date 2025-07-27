// This is a mock ad service that simulates ad displays
export const adService = {
  // Simulates showing an interstitial ad
  showInterstitialAd: async (): Promise<void> => {
    console.log("Displaying interstitial ad...");

    // Create and show mock ad overlay
    const adOverlay = document.createElement("div");
    adOverlay.style.position = "fixed";
    adOverlay.style.top = "0";
    adOverlay.style.left = "0";
    adOverlay.style.width = "100%";
    adOverlay.style.height = "100%";
    adOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    adOverlay.style.zIndex = "9999";
    adOverlay.style.display = "flex";
    adOverlay.style.flexDirection = "column";
    adOverlay.style.alignItems = "center";
    adOverlay.style.justifyContent = "center";
    adOverlay.style.color = "white";

    const adContent = document.createElement("div");
    adContent.style.padding = "20px";
    adContent.style.borderRadius = "10px";
    adContent.style.backgroundColor = "#333";
    adContent.style.textAlign = "center";
    adContent.style.maxWidth = "80%";

    const adTitle = document.createElement("h3");
    adTitle.textContent = "Advertisement";
    adTitle.style.marginBottom = "10px";
    adTitle.style.fontSize = "18px";
    adTitle.style.fontWeight = "bold";

    const adText = document.createElement("p");
    adText.textContent =
      "This is a simulated ad. In a real app, this would be an AdMob interstitial.";
    adText.style.marginBottom = "15px";

    const adTimer = document.createElement("div");
    adTimer.textContent = "Ad will close in 5 seconds...";
    adTimer.style.fontSize = "14px";
    adTimer.style.opacity = "0.8";

    adContent.appendChild(adTitle);
    adContent.appendChild(adText);
    adContent.appendChild(adTimer);
    adOverlay.appendChild(adContent);

    document.body.appendChild(adOverlay);

    // Simulate ad duration with countdown
    let secondsLeft = 5;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        secondsLeft -= 1;
        adTimer.textContent = `Ad will close in ${secondsLeft} seconds...`;

        if (secondsLeft <= 0) {
          clearInterval(interval);
          document.body.removeChild(adOverlay);
          resolve();
        }
      }, 1000);
    });
  },
};
