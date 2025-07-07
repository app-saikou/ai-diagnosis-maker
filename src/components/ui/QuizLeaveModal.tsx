import { X } from 'lucide-react';

interface QuizLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const QuizLeaveModal: React.FC<QuizLeaveModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
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
            相談を中止しますか？
          </h2>
          <p className="text-gray-600">
            相談を中止すると、現在の進行状況は保存されません。
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            相談を続ける
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary"
          >
            中止する
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizLeaveModal;