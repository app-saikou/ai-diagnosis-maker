import { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyles = "fixed top-4 left-1/2 -translate-x-1/2 flex items-center p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50 min-w-[300px] justify-center";
  const typeStyles = {
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-primary-100 text-primary-800 border border-primary-200"
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} animate-fade-in`}>
      <span className="mr-2 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;