import html2canvas from "html2canvas";

interface ShareImageParams {
  appTitle: string;
  quizTitle: string;
  resultTitle: string;
  resultDescription: string;
  url?: string; // URLを追加
}

export const imageService = {
  /**
   * QRコードを生成する関数
   */
  generateQRCode: (url: string): string => {
    // QRコード生成APIを使用
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      url
    )}`;
    return qrApiUrl;
  },

  /**
   * QRコード付きの画像生成
   */
  generateQRShareImage: async ({
    appTitle,
    quizTitle,
    resultTitle,
    resultDescription,
    url = "https://your-app.com",
  }: ShareImageParams): Promise<string> => {
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #8B5CF6 0%, #14B8A6 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: white;
      text-align: center;
      z-index: -1;
    `;

    // メインコンテンツ
    const content = document.createElement("div");
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 800px;
    `;

    // アプリタイトル
    const appTitleEl = document.createElement("div");
    appTitleEl.style.cssText = `
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    `;
    appTitleEl.textContent = appTitle;

    // 相談タイトル
    const quizTitleEl = document.createElement("div");
    quizTitleEl.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 30px;
      color: rgba(255,255,255,0.9);
    `;
    quizTitleEl.textContent = quizTitle;

    // 結果タイトル
    const resultTitleEl = document.createElement("div");
    resultTitleEl.style.cssText = `
      font-size: 44px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    `;
    resultTitleEl.textContent = resultTitle;

    // 結果説明
    const resultDescEl = document.createElement("div");
    resultDescEl.style.cssText = `
      font-size: 24px;
      line-height: 1.4;
      max-width: 600px;
      color: rgba(255,255,255,0.9);
      margin-bottom: 30px;
    `;
    resultDescEl.textContent =
      resultDescription.length > 60
        ? resultDescription.substring(0, 60) + "..."
        : resultDescription;

    // QRコード
    const qrCodeEl = document.createElement("img");
    qrCodeEl.style.cssText = `
      width: 120px;
      height: 120px;
      background: white;
      padding: 10px;
      border-radius: 10px;
      margin-top: 20px;
    `;
    qrCodeEl.src = imageService.generateQRCode(url);
    qrCodeEl.alt = "QR Code";

    // QRコードの説明
    const qrTextEl = document.createElement("div");
    qrTextEl.style.cssText = `
      font-size: 16px;
      margin-top: 10px;
      color: rgba(255,255,255,0.8);
    `;
    qrTextEl.textContent = "QRコードをスキャンしてアプリにアクセス";

    // 要素を組み立て
    content.appendChild(appTitleEl);
    content.appendChild(quizTitleEl);
    content.appendChild(resultTitleEl);
    content.appendChild(resultDescEl);
    content.appendChild(qrCodeEl);
    content.appendChild(qrTextEl);

    container.appendChild(content);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        width: 1200,
        height: 630,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png", 0.9);
      return dataUrl;
    } finally {
      document.body.removeChild(container);
    }
  },

  /**
   * HTML2Canvasを使って動的にシェア画像を生成
   * アプリタイトル、相談タイトル、相談結果を美しくレイアウト
   */
  generateShareImage: async ({
    appTitle,
    quizTitle,
    resultTitle,
    resultDescription,
  }: ShareImageParams): Promise<string> => {
    // 動的にHTML要素を作成
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #8B5CF6 0%, #14B8A6 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: white;
      text-align: center;
      z-index: -1;
    `;

    // アプリタイトル
    const appTitleEl = document.createElement("div");
    appTitleEl.style.cssText = `
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    `;
    appTitleEl.textContent = appTitle;

    // 装飾ライン
    const line1 = document.createElement("div");
    line1.style.cssText = `
      width: 400px;
      height: 2px;
      background: rgba(255,255,255,0.3);
      margin: 20px 0;
    `;

    // 相談タイトル
    const quizTitleEl = document.createElement("div");
    quizTitleEl.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 30px;
      color: rgba(255,255,255,0.9);
    `;
    quizTitleEl.textContent = quizTitle;

    // 結果タイトル
    const resultTitleEl = document.createElement("div");
    resultTitleEl.style.cssText = `
      font-size: 44px;
      font-weight: bold;
      margin-bottom: 20px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    `;
    resultTitleEl.textContent = resultTitle;

    // アクセントライン
    const line2 = document.createElement("div");
    line2.style.cssText = `
      width: 300px;
      height: 3px;
      background: rgba(255,255,255,0.8);
      margin: 20px 0;
    `;

    // 結果説明
    const resultDescEl = document.createElement("div");
    resultDescEl.style.cssText = `
      font-size: 24px;
      line-height: 1.4;
      max-width: 900px;
      color: rgba(255,255,255,0.9);
      margin-top: 20px;
    `;
    resultDescEl.textContent =
      resultDescription.length > 80
        ? resultDescription.substring(0, 80) + "..."
        : resultDescription;

    // 要素を組み立て
    container.appendChild(appTitleEl);
    container.appendChild(line1);
    container.appendChild(quizTitleEl);
    container.appendChild(resultTitleEl);
    container.appendChild(line2);
    container.appendChild(resultDescEl);

    // DOMに追加
    document.body.appendChild(container);

    try {
      // HTML2Canvasで画像生成
      const canvas = await html2canvas(container, {
        width: 1200,
        height: 630,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      // Base64データURLに変換
      const dataUrl = canvas.toDataURL("image/png", 0.9);

      return dataUrl;
    } finally {
      // 一時要素を削除
      document.body.removeChild(container);
    }
  },

  /**
   * より高品質な画像生成（複雑なレイアウト）
   */
  generateAdvancedShareImage: async ({
    appTitle,
    quizTitle,
    resultTitle,
    resultDescription,
  }: ShareImageParams): Promise<string> => {
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: white;
      text-align: center;
      z-index: -1;
      position: relative;
      overflow: hidden;
    `;

    // 装飾的な背景要素
    const bgCircle1 = document.createElement("div");
    bgCircle1.style.cssText = `
      position: absolute;
      top: -50px;
      left: -50px;
      width: 200px;
      height: 200px;
      background: rgba(139, 92, 246, 0.2);
      border-radius: 50%;
    `;

    const bgCircle2 = document.createElement("div");
    bgCircle2.style.cssText = `
      position: absolute;
      bottom: -75px;
      right: -75px;
      width: 300px;
      height: 300px;
      background: rgba(20, 184, 166, 0.2);
      border-radius: 50%;
    `;

    // メインコンテンツ
    const content = document.createElement("div");
    content.style.cssText = `
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    `;

    // アプリタイトル（ロゴ風）
    const appTitleEl = document.createElement("div");
    appTitleEl.style.cssText = `
      font-size: 40px;
      font-weight: bold;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      color: #E5E7EB;
    `;
    appTitleEl.textContent = appTitle;

    // 相談タイトル（サブタイトル風）
    const quizTitleEl = document.createElement("div");
    quizTitleEl.style.cssText = `
      font-size: 28px;
      font-weight: normal;
      margin-bottom: 40px;
      color: #D1D5DB;
    `;
    quizTitleEl.textContent = quizTitle;

    // 結果タイトル（メイン）
    const resultTitleEl = document.createElement("div");
    resultTitleEl.style.cssText = `
      font-size: 44px;
      font-weight: bold;
      margin-bottom: 30px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    `;
    resultTitleEl.textContent = resultTitle;

    // アクセントライン
    const accentLine = document.createElement("div");
    accentLine.style.cssText = `
      width: 400px;
      height: 3px;
      background: linear-gradient(90deg, #8B5CF6, #14B8A6);
      margin: 20px 0 30px 0;
    `;

    // 結果説明
    const resultDescEl = document.createElement("div");
    resultDescEl.style.cssText = `
      font-size: 22px;
      line-height: 1.5;
      max-width: 900px;
      color: #D1D5DB;
    `;
    resultDescEl.textContent =
      resultDescription.length > 80
        ? resultDescription.substring(0, 80) + "..."
        : resultDescription;

    // 要素を組み立て
    content.appendChild(appTitleEl);
    content.appendChild(quizTitleEl);
    content.appendChild(resultTitleEl);
    content.appendChild(accentLine);
    content.appendChild(resultDescEl);

    container.appendChild(bgCircle1);
    container.appendChild(bgCircle2);
    container.appendChild(content);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        width: 1200,
        height: 630,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png", 0.9);
      return dataUrl;
    } finally {
      document.body.removeChild(container);
    }
  },

  /**
   * シンプルで美しい画像生成（軽量版）
   */
  generateSimpleShareImage: async ({
    appTitle,
    quizTitle,
    resultTitle,
    resultDescription,
  }: ShareImageParams): Promise<string> => {
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1200px;
      height: 630px;
      background: #8B5CF6;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      color: white;
      text-align: center;
      z-index: -1;
    `;

    // アプリタイトル
    const appTitleEl = document.createElement("div");
    appTitleEl.style.cssText = `
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 40px;
    `;
    appTitleEl.textContent = appTitle;

    // 相談タイトル
    const quizTitleEl = document.createElement("div");
    quizTitleEl.style.cssText = `
      font-size: 24px;
      font-weight: normal;
      margin-bottom: 40px;
      opacity: 0.9;
    `;
    quizTitleEl.textContent = quizTitle;

    // 結果タイトル
    const resultTitleEl = document.createElement("div");
    resultTitleEl.style.cssText = `
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 30px;
    `;
    resultTitleEl.textContent = resultTitle;

    // 結果説明
    const resultDescEl = document.createElement("div");
    resultDescEl.style.cssText = `
      font-size: 18px;
      line-height: 1.4;
      max-width: 800px;
      opacity: 0.9;
    `;
    resultDescEl.textContent =
      resultDescription.length > 60
        ? resultDescription.substring(0, 60) + "..."
        : resultDescription;

    container.appendChild(appTitleEl);
    container.appendChild(quizTitleEl);
    container.appendChild(resultTitleEl);
    container.appendChild(resultDescEl);

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        width: 1200,
        height: 630,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png", 0.9);
      return dataUrl;
    } finally {
      document.body.removeChild(container);
    }
  },
};
