import {
  BrainCircuit,
  // Heart,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-gray-200">
          {/* Logo & Info */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <BrainCircuit className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                {t("appName")}
              </span>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t("footerDescription")}
            </p>
            <p className="text-xs mb-6">{t("amazonAssociate")}</p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("create")}
                </Link>
              </li>
              <li>
                <Link
                  to="/explore"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("explore")}
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("profile")}
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("legalInfo")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/legal"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("legalNotice")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie"
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t("cookiePolicy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              {t("contact")}
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:webzero.net@gmail.com"
                  className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  webzero.net@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 mb-4 md:mb-0 text-center w-full">
              <p className="mb-2">
                © {currentYear} {t("appName")}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
