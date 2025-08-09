import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "./Header";
import Footer from "./Footer";
import { useUser } from "../../contexts/UserContext";
import GoogleTestAdBanner from "../ui/GoogleTestAdBanner";
import MobileFooterNav from "./MobileFooterNav";
import StructuredData from "../ui/StructuredData";
import ShareMetaTags from "../ui/ShareMetaTags";

const Layout = () => {
  const { isPremium } = useUser();
  const location = useLocation();

  // 現在のページに基づいてメタデータを設定
  const getPageMeta = () => {
    const path = location.pathname;

    switch (path) {
      case "/":
        return {
          title: "AIだけどなにか相談ある？ - AI相談メーカー",
          description:
            "AIに簡単に相談できるプラットフォーム。あなたの相談に診断テスト形式で回答します。",
          type: "website" as const,
        };
      case "/create":
        return {
          title: "クイズ作成 - AI相談メーカー",
          description: "AIを活用してオリジナルの診断クイズを作成しましょう。",
          type: "quiz" as const,
        };
      case "/explore":
        return {
          title: "クイズ探索 - AI相談メーカー",
          description:
            "様々な診断クイズを探索して、あなたに合ったものを探しましょう。",
          type: "website" as const,
        };
      case "/pricing":
        return {
          title: "料金プラン - AI相談メーカー",
          description:
            "プレミアム機能とチケット購入の料金プランをご確認ください。",
          type: "website" as const,
        };
      case "/profile":
        return {
          title: "プロフィール - AI相談メーカー",
          description: "あなたのプロフィールと利用状況を管理できます。",
          type: "website" as const,
        };
      default:
        return {
          title: "AIだけどなにか相談ある？ - AI相談メーカー",
          description: "AIに簡単に相談できるプラットフォーム。",
          type: "website" as const,
        };
    }
  };

  const pageMeta = getPageMeta();

  return (
    <>
      <Helmet>
        <title>{pageMeta.title}</title>
        <meta name="description" content={pageMeta.description} />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="ja" />
        <meta name="author" content="AIだけどなにか相談ある？" />
        <link
          rel="canonical"
          href={`https://ai-consultation.netlify.app${location.pathname}`}
        />
      </Helmet>

      <StructuredData type={pageMeta.type} data={pageMeta} />
      <ShareMetaTags
        title={pageMeta.title}
        description={pageMeta.description}
        url={`https://ai-consultation.netlify.app${location.pathname}`}
      />

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
    </>
  );
};

export default Layout;
