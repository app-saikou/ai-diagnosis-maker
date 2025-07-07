import { useLanguage } from '../../contexts/LanguageContext';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ja' : 'en');
  };
  
  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
      aria-label="Toggle language"
    >
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">
        {language === 'en' ? 'JA' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;