import React, { createContext, useContext, useState } from 'react';
import { ja } from '../i18n/ja';
import { en } from '../i18n/en';

type Language = 'en' | 'ja';
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  t: (key: keyof typeof en) => string;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ja');
  
  const translations: Record<Language, Translations> = {
    en,
    ja
  };
  
  const t = (key: keyof typeof en) => {
    return translations[language][key];
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};