import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wand2, Shuffle, Shield } from "lucide-react";
import { useQuiz } from "../contexts/QuizContext";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { aiService } from "../services/aiService";
import { containsNgWord } from "../utils/ngWords";
import QuizModeSelector from "../components/ui/QuizModeSelector";
import AuthPrompt from "../components/ui/AuthPrompt";
import AuthModal from "../components/auth/AuthModal";
import QuizConfirmModal from "../components/ui/QuizConfirmModal";
import { QuizMode } from "../types";
import StructuredData from "../components/ui/StructuredData";
import CanonicalUrl from "../components/ui/CanonicalUrl";

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { generateQuiz, isGenerating, error } = useQuiz();
  const { canTakeQuiz, incrementQuizCount } = useUser();
  const { language, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // 言語に応じた文字数制限
  const maxTitleLength = language === "en" ? 100 : 50;

  const [title, setTitle] = useState(aiService.getRandomTitle(language));
  const [selectedMode, setSelectedMode] = useState<QuizMode>("standard");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState<{
    title: string;
    mode: QuizMode;
  } | null>(null);
  const [ngWordError, setNgWordError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(aiService.getRandomTitle(language));
  }, [language]);

  const handleShuffle = () => {
    setTitle(aiService.getRandomTitle(language));
    // シャッフル時にエラーをクリア
    setNgWordError(null);
    if (localError && localError.includes("タイトル")) {
      setLocalError(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    // 50文字制限
    if (newTitle.length <= maxTitleLength) {
      setTitle(newTitle);

      // NGワードチェック
      const ngWordCheck = containsNgWord(newTitle);
      if (ngWordCheck.hasNgWord) {
        setNgWordError(t("inappropriateWordDetected"));
      } else {
        setNgWordError(null);
      }

      // エラーメッセージをクリア
      if (localError && localError.includes("タイトル")) {
        setLocalError(null);
      }
    }
  };

  const handleCreateQuiz = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!canTakeQuiz) {
      setLocalError(t("upgradeToPremium"));
      return;
    }

    // タイトルの入力チェック
    if (!title.trim()) {
      setLocalError(t("titleRequired"));
      return;
    }

    // NGワードチェック
    const ngWordCheck = containsNgWord(title.trim());
    if (ngWordCheck.hasNgWord) {
      setNgWordError(t("inappropriateWordDetected"));
      setLocalError(t("inappropriateContent"));
      return;
    }

    setLocalError(null);
    setNgWordError(null);
    setPendingQuiz({ title: title.trim(), mode: selectedMode });
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingQuiz) return;

    setShowConfirmModal(false);

    try {
      const newQuiz = await generateQuiz(pendingQuiz.title, pendingQuiz.mode);
      incrementQuizCount();
      navigate(`/quiz/${newQuiz.id}`);
    } catch (err) {
      console.error("Error generating quiz:", err);
      setLocalError(
        err instanceof Error ? err.message : "Error generating quiz"
      );
    } finally {
      setPendingQuiz(null);
    }
  };

  // タイトルが空かどうかをチェック
  const isTitleEmpty = !title.trim();
  // 文字数カウント
  const titleLength = title.length;
  // NGワードが含まれているかチェック
  const hasNgWord = containsNgWord(title).hasNgWord;

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthPrompt
          title="認証が必要です"
          message="この機能を利用するにはログインが必要です"
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <>
      <StructuredData
        type="article"
        data={{
          title: t("createConsultation"),
          description: t("createConsultationDescription"),
          url: "https://ai-consultation.netlify.app/create",
        }}
      />
      <CanonicalUrl url="https://ai-consultation.netlify.app/create" />
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t("createConsultation")}</h1>
          <p className="text-gray-600">{t("createConsultationDescription")}</p>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                {t("consultationTitle")}
              </h2>
              <span
                className={`text-sm ${
                  titleLength > maxTitleLength * 0.8
                    ? "text-orange-500"
                    : "text-gray-500"
                }`}
              >
                {titleLength}/{maxTitleLength}
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                id="quiz-title"
                value={title}
                onChange={handleTitleChange}
                className={`input pr-10 ${
                  isTitleEmpty || hasNgWord
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : ""
                }`}
                placeholder={t("consultationTitlePlaceholder")}
                maxLength={maxTitleLength}
              />
              <button
                onClick={handleShuffle}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600"
                title={t("shuffle")}
              >
                <Shuffle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-1 flex justify-between items-start">
              <p className="text-sm text-gray-500">
                {t("consultationTitleDescription")}
              </p>
            </div>
            {isTitleEmpty && (
              <p className="mt-1 text-sm text-red-600">{t("titleRequired")}</p>
            )}
            {ngWordError && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                {ngWordError}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("consultationMode")}
            </h2>
            <QuizModeSelector
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
            />
          </div>

          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error || localError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={handleCreateQuiz}
              disabled={
                isGenerating || !canTakeQuiz || isTitleEmpty || hasNgWord
              }
              className={`btn-primary flex-1 flex items-center justify-center ${
                isTitleEmpty || hasNgWord ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t("generating")}
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  {t("generateConsultation")}
                </>
              )}
            </button>
          </div>
        </div>

        <QuizConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setPendingQuiz(null);
          }}
          onConfirm={handleConfirmCreate}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    </>
  );
};

export default CreateQuizPage;
