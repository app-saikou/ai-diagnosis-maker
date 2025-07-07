import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useUser } from '../../contexts/UserContext';
import { useEffect } from 'react';
import { adService } from '../../services/adService';

const Layout = () => {
  const { isPremium } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Show or remove banner ads based on premium status
    if (!isPremium) {
      adService.showBannerAd();
    } else {
      adService.removeAds();
    }
    
    // Cleanup on unmount
    return () => {
      adService.removeAds();
    };
  }, [isPremium]);

  // 診断ページでのナビゲーション処理
  const isQuizPage = location.pathname.startsWith('/quiz/');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container-custom py-6 md:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;