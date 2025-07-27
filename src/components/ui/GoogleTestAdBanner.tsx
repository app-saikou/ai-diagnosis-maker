import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const GoogleTestAdBanner = () => {
  useEffect(() => {
    // Google AdSenseのスクリプトがなければ追加
    if (!window.adsbygoogle && !document.getElementById("adsbygoogle-js")) {
      const script = document.createElement("script");
      script.id = "adsbygoogle-js";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      document.body.appendChild(script);
    }
    setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []) as unknown[];
        (window.adsbygoogle as unknown[]).push({});
      } catch {
        // ignore
      }
    }, 500);
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minHeight: 60 }}
        data-ad-client="ca-pub-3940256099942544" // Google公式テストID
        data-ad-slot="1234567890" // 任意の数字
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default GoogleTestAdBanner;
