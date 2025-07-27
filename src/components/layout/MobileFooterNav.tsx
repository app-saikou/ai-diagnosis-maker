import { Link, useLocation } from "react-router-dom";
import { MessageCircle, Search, CreditCard, User } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function MobileFooterNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    {
      to: "/create",
      label: t("create"),
      icon: <MessageCircle className="w-6 h-6" />,
    },
    {
      to: "/explore",
      label: t("explore"),
      icon: <Search className="w-6 h-6" />,
    },
    {
      to: "/pricing",
      label: t("pricing"),
      icon: <CreditCard className="w-6 h-6" />,
    },
    { to: "/profile", label: t("profile"), icon: <User className="w-6 h-6" /> },
  ];
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t z-50 flex justify-around py-2 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center text-xs transition-colors duration-150 ${
            location.pathname === item.to ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
