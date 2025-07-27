import { useState, useEffect } from "react";
import { useQuiz } from "../contexts/QuizContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, PlayCircle, Lock } from "lucide-react";
import QuizConfirmModal from "../components/ui/QuizConfirmModal";
import AuthModal from "../components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { Quiz } from "../types";

const ExplorePage = () => {
  const navigate = useNavigate();
  const { quizzes, refreshQuizzes } = useQuiz();
  const { t } = useLanguage();
  const { quizzesRemaining, isPremium } = useUser();
  const { isAuthenticated } = useAuth();

  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    refreshQuizzes();
  }, []); // 依存配列を空にして、マウント時に1回だけ実行

  const handleQuizClick = (quiz: Quiz) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (quizzesRemaining <= 0) {
      // チケットが不足している場合の処理
      return;
    }

    setSelectedQuiz(quiz);
    setShowConfirmModal(true);
  };

  const handleConfirmQuiz = () => {
    if (selectedQuiz) {
      navigate(`/take-quiz/${selectedQuiz.id}`);
    }
    setShowConfirmModal(false);
    setSelectedQuiz(null);
  };

  const sortedQuizzes = [...quizzes].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (b.likes || 0) - (a.likes || 0);
    }
  });

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">{t("explore")}</h1>
        </div>
        <p className="text-gray-600">{t("createQuizDescription")}</p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-primary-700 text-sm">
              {t("ticketsRemaining").replace(
                "{count}",
                quizzesRemaining.toString()
              )}
              <br />
              {!isPremium && t("upgradeToIncreaseLimit")}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setSortBy("newest")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "newest"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("newest")}
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "popular"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t("popular")}
          </button>
        </div>
      </div>

      {sortedQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <PlayCircle className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            まだ相談がありません
          </h3>
          <p className="text-gray-600">最初の相談を作成してみましょう</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleQuizClick(quiz)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {quiz.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{quiz.questions?.length || 0}問</span>
                  <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <QuizConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmQuiz}
      />
    </div>
  );
};

export default ExplorePage;
