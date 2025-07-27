import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useUser } from "../../contexts/UserContext";
import GoogleTestAdBanner from "../ui/GoogleTestAdBanner";
import MobileFooterNav from "./MobileFooterNav";

const Layout = () => {
  const { isPremium } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container-custom py-6 md:py-8">
        <Outlet />
      </main>
      {/* バナー広告をFooter直前で分岐表示 */}
      {!isPremium && <GoogleTestAdBanner />}
      <Footer />
      <MobileFooterNav />
    </div>
  );
};

export default Layout;
