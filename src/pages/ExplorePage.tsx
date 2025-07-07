import { useState, useEffect } from "react";
import { useQuiz } from "../contexts/QuizContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useUser } from "../contexts/UserContext";
import { useAuth } from "../contexts/AuthContext";
import { AlertCircle, PlayCircle, RefreshCw, Lock } from "lucide-react";
import QuizConfirmModal from "../components/ui/QuizConfirmModal";
import AuthModal from "../components/auth/AuthModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type SortOption = "newest" | "popular";

const ExplorePage = () => {
  const { quizzes, isLoading, refreshQuizzes, getLikeCount } = useQuiz();
  const { t, language } = useLanguage();
  const { quizzesRemaining, isPremium, dailyLimit, canTakeQuiz } = useUser();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ページ読み込み時とフォーカス時にクイズリストを更新
  useEffect(() => {
    const handleFocus = () => {
      refreshQuizzes();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshQuizzes]);

  // 定期的なクイズリスト更新（30秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuizzes();
    }, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, [refreshQuizzes]);

  // リアルタイムでquiz_likesの変化を監視し、即時リストを更新
  useEffect(() => {
    const channel = supabase
      .channel("quiz_likes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_likes",
        },
        (payload) => {
          refreshQuizzes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshQuizzes]);

  // ページ遷移時に正確ないいね数を取得するため、初期ロードを実行
  useEffect(() => {
    refreshQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedQuizzes = [...quizzes].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.completions + b.likes - (a.completions + a.likes);
    }
  });

  const buttonText = {
    newest: language === "ja" ? "新着順" : "Newest",
    popular: language === "ja" ? "人気順" : "Most Popular",
  };

  const handleStartQuiz = (quizId: string) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!canTakeQuiz) {
      // 相談回数が上限に達している場合は何もしない
      return;
    }

    setSelectedQuizId(quizId);
    setShowConfirmModal(true);
  };

  const handleConfirmStartQuiz = () => {
    if (!selectedQuizId) return;

    navigate(`/quiz/${selectedQuizId}`);
    setShowConfirmModal(false);
    setSelectedQuizId(null);
  };

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
              {language === "ja"
                ? `残り相談チケット: ${quizzesRemaining}枚 / ${dailyLimit}枚`
                : `${quizzesRemaining} consultation tickets remaining out of ${dailyLimit}`}
              <br />
              {!isPremium &&
                (language === "ja"
                  ? "プレミアムにアップグレードして制限を緩和しましょう"
                  : "Upgrade to premium to increase your daily limit")}
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
            {buttonText.newest}
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              sortBy === "popular"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {buttonText.popular}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">相談を読み込み中...</p>
        </div>
      ) : sortedQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedQuizzes.map((quiz) => (
            <div key={quiz.id} className="card card-hover">
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {quiz.title}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {quiz.description}
                </p>

                {/* 作成者名を表示 */}
                <div className="flex items-center text-xs text-gray-500 mb-3">
                  <span>作成者: {quiz.creatorDisplayName}</span>
                </div>

                <div className="flex justify-between items-center mt-auto">
                  <div className="flex space-x-3 text-xs text-gray-500">
                    <span>{quiz.completions}回相談</span>
                    <span>{quiz.likes}いいね</span>
                  </div>

                  <button
                    onClick={() => handleStartQuiz(quiz.id)}
                    disabled={!canTakeQuiz}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      canTakeQuiz
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={
                      !canTakeQuiz ? "本日の相談回数上限に達しています" : ""
                    }
                  >
                    {canTakeQuiz ? (
                      <>
                        <PlayCircle className="h-5 w-5 mr-1" />
                        {language === "ja" ? "相談を始める" : "Start Quiz"}
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-1" />
                        {language === "ja"
                          ? "上限に達しました"
                          : "Limit Reached"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("noQuizzesFound")}
          </h3>
          <p className="text-gray-600 mb-6">{t("beFirstToCreate")}</p>
        </div>
      )}

      <QuizConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedQuizId(null);
        }}
        onConfirm={handleConfirmStartQuiz}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default ExplorePage;
