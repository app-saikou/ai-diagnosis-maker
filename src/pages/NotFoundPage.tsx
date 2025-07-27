import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="h-16 w-16 text-primary-500 mb-6" />

      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {t("pageNotFound")}
      </h1>

      <p className="text-lg text-gray-600 mb-8 max-w-lg">
        {t("pageNotFoundDescription")}
      </p>

      <div className="flex space-x-4">
        <button onClick={() => navigate(-1)} className="btn-outline">
          {t("goBack")}
        </button>

        <button
          onClick={() => navigate("/")}
          className="btn-primary flex items-center"
        >
          <Home className="h-4 w-4 mr-2" />
          {t("goHome")}
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
