import { X } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { useAuth } from "../../contexts/AuthContext";

interface QuizConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const QuizConfirmModal: React.FC<QuizConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { quizzesRemaining, isPremium, dailyLimit } = useUser();
  const { isAuthenticated } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            相談しますか？
          </h2>
          <p className="text-gray-600">
            開始すると、相談チケットが1枚消費されます。
            <br />
            {isAuthenticated ? (
              <>残り相談チケット: {quizzesRemaining}枚</>
            ) : (
              `ゲストユーザーの残り相談チケット: ${quizzesRemaining}枚`
            )}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="btn-outline">
            キャンセル
          </button>
          <button onClick={onConfirm} className="btn-primary">
            開始する
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizConfirmModal;
