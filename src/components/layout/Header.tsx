import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  BrainCircuit,
  Menu,
  X,
  LogOut,
  LogIn,
  Crown,
  ChevronDown,
  User,
  Languages,
  Ticket,
  Info,
} from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../auth/AuthModal";
import ProfileAvatar from "../ui/ProfileAvatar";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">(
    "top"
  );
  const location = useLocation();
  const {
    user: userProfile,
    isPremium,
    quizzesRemaining,
    timeToNextReset,
  } = useUser();
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, signOut, user: authUser } = useAuth();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipContainerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // ドロップダウンとツールチップの外側をクリックしたときに閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }

      // ツールチップの外側をクリックしたときに閉じる
      if (
        tooltipContainerRef.current &&
        !tooltipContainerRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await signOut();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Stripe Checkout連携
  const handlePremiumClick = async () => {
    try {
      const userId = authUser?.id;
      if (!userId) throw new Error("ユーザーIDが取得できません");

      const apiUrl =
        import.meta.env.MODE === "production"
          ? "/.netlify/functions/create-checkout"
          : "http://localhost:4242/api/create-checkout-session";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      alert("決済ページへの遷移に失敗しました");
      console.error(err);
    }
    setIsDropdownOpen(false);
  };

  const handleSignOutClick = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ja" : "en");
    setIsDropdownOpen(false);
  };

  // ツールチップの位置を計算する関数
  const calculateTooltipPosition = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;

      // 上に十分なスペースがない場合は下に表示
      if (spaceAbove < 80) {
        setTooltipPosition("bottom");
      } else {
        setTooltipPosition("top");
      }
    }
  };

  // デスクトップ用のマウスイベント
  const handleTooltipMouseEnter = () => {
    if (window.innerWidth >= 768) {
      // デスクトップのみ
      setShowTooltip(true);
      setTimeout(calculateTooltipPosition, 10);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (window.innerWidth >= 768) {
      // デスクトップのみ
      setShowTooltip(false);
    }
  };

  // モバイル用のタップイベント
  const handleTooltipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.innerWidth < 768) {
      // モバイルのみ
      if (!showTooltip) {
        setShowTooltip(true);
        setTimeout(calculateTooltipPosition, 10);
      } else {
        setShowTooltip(false);
      }
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BrainCircuit className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 hidden md:inline">
              {t("appName")}
            </span>
          </Link>

          {/* モバイル用チケット表示と言語切り替え */}
          <div className="flex items-center space-x-2 md:hidden">
            <div className="relative" ref={tooltipContainerRef}>
              <div
                ref={tooltipRef}
                className="flex items-center justify-center px-2 py-1.5 bg-primary-50 rounded-md border border-primary-200 cursor-help transition-colors active:bg-primary-100"
                onClick={handleTooltipClick}
              >
                <Ticket className="h-4 w-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-primary-700">
                  {quizzesRemaining}
                  {t("tickets")}
                </span>
                <Info className="h-3 w-3 text-primary-500 ml-1" />
              </div>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg animate-fade-in">
                    {timeToNextReset}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>

            {/* モバイル用言語切り替えボタン */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle language"
            >
              <Languages className="h-5 w-5" />
              <span className="text-sm font-medium">
                {language === "en" ? t("japaneseShort") : t("englishShort")}
              </span>
            </button>

            <button
              className="p-2 rounded-md"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-900" />
              ) : (
                <Menu className="h-6 w-6 text-gray-900" />
              )}
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                location.pathname === "/" ? "text-primary-600" : "text-gray-700"
              }`}
            >
              {t("home")}
            </Link>
            <Link
              to="/create"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                location.pathname === "/create"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("create")}
            </Link>
            <Link
              to="/explore"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                location.pathname === "/explore"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("explore")}
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                location.pathname === "/pricing"
                  ? "text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("pricing")}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* 相談チケット表示（ツールチップ付き） */}
                <div className="relative" ref={tooltipContainerRef}>
                  <div
                    ref={tooltipRef}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-200 cursor-help transition-colors hover:bg-primary-100"
                    onMouseEnter={handleTooltipMouseEnter}
                    onMouseLeave={handleTooltipMouseLeave}
                    onClick={handleTooltipClick}
                  >
                    <Ticket className="h-4 w-4 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">
                      {quizzesRemaining}
                      {t("tickets")}
                    </span>
                    <Info className="h-3 w-3 text-primary-500" />
                  </div>

                  {/* ツールチップ */}
                  {showTooltip && (
                    <div
                      className={`absolute left-1/2 transform -translate-x-1/2 z-50 ${
                        tooltipPosition === "top"
                          ? "bottom-full mb-2"
                          : "top-full mt-2"
                      }`}
                    >
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg animate-fade-in">
                        {timeToNextReset}
                        <div
                          className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent ${
                            tooltipPosition === "top"
                              ? "top-full border-t-4 border-t-gray-900"
                              : "bottom-full border-b-4 border-b-gray-900"
                          }`}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ProfileAvatar
                      displayName={userProfile.displayName}
                      profileImageUrl={userProfile.profileImageUrl}
                      size="sm"
                    />
                    <ChevronDown
                      className={`h-4 w-4 text-gray-600 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {t("profile")}
                      </Link>

                      <button
                        onClick={toggleLanguage}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Languages className="h-4 w-4 mr-2" />
                        {language === "en" ? t("japanese") : t("english")}
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      {!isPremium && (
                        <button
                          onClick={handlePremiumClick}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 flex items-center"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          {t("goPremium")}
                        </button>
                      )}

                      <button
                        onClick={handleSignOutClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("signOut")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* 言語切り替えボタン（未認証ユーザー用） */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Toggle language"
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {language === "en" ? t("japaneseShort") : t("englishShort")}
                  </span>
                </button>

                <button
                  onClick={handleAuthClick}
                  className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-primary-50 text-primary-600 hover:bg-primary-100"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  {t("signIn")}
                </button>
              </div>
            )}
          </nav>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col space-y-4 animate-fade-in">
            <Link
              to="/"
              className={`flex items-center p-2 rounded-md ${
                location.pathname === "/"
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("home")}
            </Link>
            <Link
              to="/create"
              className={`flex items-center p-2 rounded-md ${
                location.pathname === "/create"
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("create")}
            </Link>
            <Link
              to="/explore"
              className={`flex items-center p-2 rounded-md ${
                location.pathname === "/explore"
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("explore")}
            </Link>
            <Link
              to="/pricing"
              className={`flex items-center p-2 rounded-md ${
                location.pathname === "/pricing"
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700"
              }`}
            >
              {t("pricing")}
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className={`flex items-center p-2 rounded-md ${
                    location.pathname === "/profile"
                      ? "bg-primary-50 text-primary-600"
                      : "text-gray-700"
                  }`}
                >
                  <User className="h-4 w-4 mr-2" />
                  {t("profile")}
                </Link>
              </>
            )}
          </div>
        )}
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};

export default Header;
