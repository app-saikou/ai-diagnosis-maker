// This is a mock ad service that simulates ad displays
export const adService = {
  // Simulates showing an interstitial ad
  showInterstitialAd: async (): Promise<void> => {
    console.log('Displaying interstitial ad...');
    
    // Create and show mock ad overlay
    const adOverlay = document.createElement('div');
    adOverlay.style.position = 'fixed';
    adOverlay.style.top = '0';
    adOverlay.style.left = '0';
    adOverlay.style.width = '100%';
    adOverlay.style.height = '100%';
    adOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    adOverlay.style.zIndex = '9999';
    adOverlay.style.display = 'flex';
    adOverlay.style.flexDirection = 'column';
    adOverlay.style.alignItems = 'center';
    adOverlay.style.justifyContent = 'center';
    adOverlay.style.color = 'white';
    
    const adContent = document.createElement('div');
    adContent.style.padding = '20px';
    adContent.style.borderRadius = '10px';
    adContent.style.backgroundColor = '#333';
    adContent.style.textAlign = 'center';
    adContent.style.maxWidth = '80%';
    
    const adTitle = document.createElement('h3');
    adTitle.textContent = 'Advertisement';
    adTitle.style.marginBottom = '10px';
    adTitle.style.fontSize = '18px';
    adTitle.style.fontWeight = 'bold';
    
    const adText = document.createElement('p');
    adText.textContent = 'This is a simulated ad. In a real app, this would be an AdMob interstitial.';
    adText.style.marginBottom = '15px';
    
    const adTimer = document.createElement('div');
    adTimer.textContent = 'Ad will close in 5 seconds...';
    adTimer.style.fontSize = '14px';
    adTimer.style.opacity = '0.8';
    
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
  
  // Simulates displaying a banner ad
  showBannerAd: (): void => {
    console.log('Displaying banner ad...');
    
    // Check if banner already exists
    const existingBanner = document.getElementById('mock-banner-ad');
    if (existingBanner) return;
    
    // Create and show mock banner ad
    const bannerAd = document.createElement('div');
    bannerAd.id = 'mock-banner-ad';
    bannerAd.style.position = 'fixed';
    bannerAd.style.bottom = '0';
    bannerAd.style.left = '0';
    bannerAd.style.width = '100%';
    bannerAd.style.backgroundColor = '#f0f0f0';
    bannerAd.style.padding = '10px';
    bannerAd.style.boxShadow = '0 -2px 5px rgba(0, 0, 0, 0.1)';
    bannerAd.style.zIndex = '999';
    bannerAd.style.textAlign = 'center';
    bannerAd.style.fontSize = '12px';
    bannerAd.style.display = 'flex';
    bannerAd.style.justifyContent = 'center';
    bannerAd.style.alignItems = 'center';
    
    bannerAd.innerHTML = `
      <div style="display: inline-block; padding: 5px 10px; background-color: #e1e1e1; border-radius: 4px; margin-right: 10px;">AD</div>
      <span>This is a simulated banner ad. Upgrade to premium to remove ads.</span>
      <button id="close-banner-ad" style="margin-left: 15px; padding: 2px 6px; background: none; border: none; cursor: pointer;">✕</button>
    `;
    
    document.body.appendChild(bannerAd);
    
    // Add click handler to close button
    document.getElementById('close-banner-ad')?.addEventListener('click', () => {
      document.body.removeChild(bannerAd);
    });
  },
  
  // Removes any displayed ads
  removeAds: (): void => {
    const bannerAd = document.getElementById('mock-banner-ad');
    if (bannerAd) {
      document.body.removeChild(bannerAd);
    }
    
    // Also remove any interstitial ads if they exist
    const adOverlays = document.querySelectorAll('div[style*="position: fixed"][style*="z-index: 9999"]');
    adOverlays.forEach(overlay => {
      document.body.removeChild(overlay);
    });
  }
};