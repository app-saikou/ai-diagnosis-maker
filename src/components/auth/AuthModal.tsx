import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, LogIn, UserPlus, User, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const { signIn, signUp, continueAsGuest } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          return;
        }
        await signUp(email, password, displayName);
      }
      
      // 成功した場合のみフォームをリセットしてモーダルを閉じる
      resetForm();
      onClose();
    } catch (error) {
      // エラーはAuthContextでトーストとして表示されるため、ここでは何もしない
      console.error('Authentication error:', error);
    }
  };

  const handleGuestAccess = async () => {
    try {
      await continueAsGuest();
      resetForm();
      onClose();
    } catch (error) {
      // エラーはAuthContextでトーストとして表示されるため、ここでは何もしない
      console.error('Guest authentication error:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setMode('signin');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? t('signIn') : t('signUp')}
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            {mode === 'signin' 
              ? 'アカウントにログインして、すべての機能を利用しましょう'
              : '新規登録して、AIに相談をしましょう'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input pl-10"
                  placeholder="ユーザー名を入力"
                  required
                  minLength={2}
                  maxLength={30}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-10"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full flex items-center justify-center py-3"
          >
            {mode === 'signin' ? (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                {t('signIn')}
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                {t('signUp')}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {mode === 'signin' ? t('needAccount') : t('alreadyHaveAccount')}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('or')}</span>
            </div>
          </div>

          <button
            onClick={handleGuestAccess}
            className="mt-6 btn-outline w-full flex items-center justify-center py-3"
          >
            <User className="h-5 w-5 mr-2" />
            {t('continueAsGuest')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;