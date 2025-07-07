import { BrainCircuit, Heart, Twitter, Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();
  
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
          {/* Logo & Info */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <BrainCircuit className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                {language === 'ja' ? 'AIだけど相談ある？' : 'AI Diagnosis Maker'}
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {language === 'ja'
                ? 'AIに簡単に相談できるプラットフォーム。あなたの相談に診断テスト形式で回答します。'
                : 'Create engaging personality quizzes with AI. Transform your ideas into interactive experiences.'}
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 p-3 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 p-3 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 p-3 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {language === 'ja' ? 'クイックリンク' : 'Quick Links'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'ホーム' : 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? '相談する' : 'Create'}
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? '見つける' : 'Explore'}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'マイページ' : 'Profile'}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {language === 'ja' ? 'リソース' : 'Resources'}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'ヘルプセンター' : 'Help Center'}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'よくある質問' : 'FAQ'}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'ブログ' : 'Blog'}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'プレミアム機能' : 'Premium Features'}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {language === 'ja' ? '法的情報' : 'Legal'}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? '利用規約' : 'Terms of Service'}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? 'クッキーポリシー' : 'Cookie Policy'}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">
                  {language === 'ja' ? '個人情報保護' : 'GDPR'}
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {language === 'ja' ? 'お問い合わせ' : 'Contact'}
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:contact@example.com" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  contact@example.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                  <Phone className="h-4 w-4 mr-2" />
                  +1 (234) 567-890
                </a>
              </li>
              <li>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  <span>
                    {language === 'ja'
                      ? '〒123-4567 東京都渋谷区渋谷1-1-1'
                      : '1-1-1 Shibuya, Shibuya-ku, Tokyo 123-4567'}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0">
              <p className="mb-2">
                © {currentYear} {language === 'ja' ? 'AIだけど相談ある？' : 'AI Diagnosis Maker'}. 
                {language === 'ja' ? '全ての権利を保有します。' : 'All rights reserved.'}
              </p>
              <p className="text-xs">
                {language === 'ja' 
                  ? 'このサイトはAmazonアソシエイトに参加しています。' 
                  : 'This site is a participant in the Amazon Associates Program.'}
              </p>
            </div>
            <p className="text-sm text-gray-600 flex items-center">
              {language === 'ja' ? '愛を込めて作られました' : 'Made with'} 
              <Heart className="h-4 w-4 text-red-500 mx-1" /> 
              {language === 'ja' ? 'による制作' : 'by'} 
              <a href="#" className="text-primary-600 hover:text-primary-700 ml-1">StackBlitz</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;