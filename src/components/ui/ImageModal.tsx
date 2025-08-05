import { X, Download } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  if (!isOpen || !imageUrl) return null;

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleSaveImage = async () => {
    try {
      if (isMobile()) {
        // モバイル: ライブラリに保存
        await saveToMobileGallery();
      } else {
        // デスクトップ: ファイルダウンロード
        handleDownload();
      }
    } catch (error) {
      console.error("画像保存エラー:", error);
      alert("画像の保存に失敗しました");
    }
  };

  const saveToMobileGallery = async () => {
    try {
      // Base64データURLからBlobを作成
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Web Share APIを使用（モバイルブラウザ対応）
      if (navigator.share) {
        const file = new File([blob], "share-image.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "相談結果画像",
          text: "AI相談の結果画像をシェアします",
        });
        return;
      }

      // フォールバック: 新しいタブで開いて手動保存
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "share-image.png";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(
        "画像が新しいタブで開かれました。長押ししてライブラリに保存してください。"
      );
    } catch (error) {
      console.error("モバイル保存エラー:", error);
      // フォールバック: 通常のダウンロード
      handleDownload();
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "share-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 md:p-8 w-full max-w-2xl relative animate-fade-in flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="閉じる"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="w-full flex flex-col items-center">
          <img
            src={imageUrl}
            alt="シェア画像"
            className="max-w-full max-h-[60vh] rounded-lg shadow-lg border border-gray-200"
          />
          <button
            onClick={handleSaveImage}
            className="mt-6 flex items-center px-5 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            {isMobile() ? "ライブラリに保存" : "画像を保存"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
