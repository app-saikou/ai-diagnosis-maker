import React from "react";

// Google AdSense審査通過まで一時的に無効化
const GoogleTestAdBanner = () => {
  // AdSense関連のコードを一時的にコメントアウト
  /*
  useEffect(() => {
    if (!window.adsbygoogle && !document.getElementById("adsbygoogle-js")) {
      const script = document.createElement("script");
      script.id = "adsbygoogle-js";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }

    if (window.adsbygoogle) {
      (window.adsbygoogle = window.adsbygoogle || []) as unknown[];
      (window.adsbygoogle as unknown[]).push({});
    }
  }, []);

  return (
    <div className="w-full bg-gray-100 py-4 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-2591881801621460"
          data-ad-slot="your-ad-slot-id"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
  */

  // 審査通過まで広告表示を無効化
  return (
    <div className="w-full bg-blue-50 py-4 px-4 text-center border-t border-blue-200">
      <div className="max-w-4xl mx-auto">
        <p className="text-blue-800 text-sm">
          Google AdSense審査中 - 広告表示は一時的に無効化されています
        </p>
      </div>
    </div>
  );
};

export default GoogleTestAdBanner;
