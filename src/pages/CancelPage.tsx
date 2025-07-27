import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const CancelPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // 5秒後にホームページにリダイレクト
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("paymentCancelled")}
          </h1>
          <p className="text-gray-600 mb-6">
            {t("premiumRegistrationNotCompleted")}
            <br />
            {t("pleaseTryAgainLater")}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t("goHome")}
            </button>
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              {t("goBack")}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">{t("redirectingToHome")}</p>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
