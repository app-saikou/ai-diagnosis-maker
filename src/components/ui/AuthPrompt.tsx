import { useLanguage } from '../../contexts/LanguageContext';
import { Lock } from 'lucide-react';

interface AuthPromptProps {
  title?: string;
  message?: string;
  onAuthClick: () => void;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({
  title = '認証が必要です',
  message = 'この機能を利用するにはログインが必要です',
  onAuthClick
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="h-6 w-6 text-primary-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      
      <button
        onClick={onAuthClick}
        className="btn-primary w-full sm:w-auto px-8"
      >
        {t('signIn')}
      </button>
    </div>
  );
};

export default AuthPrompt;