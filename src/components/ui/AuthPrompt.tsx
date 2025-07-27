import { useLanguage } from "../../contexts/LanguageContext";
import { Lock } from "lucide-react";

interface AuthPromptProps {
  title?: string;
  message?: string;
  onAuthClick: () => void;
}

const AuthPrompt: React.FC<AuthPromptProps> = ({
  title,
  message,
  onAuthClick,
}) => {
  const { t } = useLanguage();

  const defaultTitle = title || t("authRequired");
  const defaultMessage = message || t("authRequiredMessage");

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Lock className="h-6 w-6 text-primary-600" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {defaultTitle}
      </h3>
      <p className="text-gray-600 mb-6">{defaultMessage}</p>

      <button
        onClick={onAuthClick}
        className="btn-primary w-full sm:w-auto px-8"
      >
        {t("signIn")}
      </button>
    </div>
  );
};

export default AuthPrompt;
