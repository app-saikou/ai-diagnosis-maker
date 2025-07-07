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
            onClick={handleDownload}
            className="mt-6 flex items-center px-5 py-2 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            画像を保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
