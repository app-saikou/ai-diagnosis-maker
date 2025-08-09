import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Crown,
  X,
  Star,
  ChevronRight,
  History,
  Settings,
  Gift,
  Save,
  Edit2,
  Trash2,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { useQuiz } from "../contexts/QuizContext";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import AuthPrompt from "../components/ui/AuthPrompt";
import AuthModal from "../components/auth/AuthModal";
import ProfileAvatar from "../components/ui/ProfileAvatar";
import LoginStreakDisplay from "../components/ui/LoginStreakDisplay";
import { supabase } from "../lib/supabase";

type FetchedQuizzes = {
  [key: string]: {
    title: string;
    results: Array<{
      id: string;
      title: string;
      imageUrl?: string;
      recommendedAction?: string;
    }>;
    createdBy: string;
  };
};

interface UserStats {
  createdQuizzes: number;
  totalLikes: number;
  totalCompletions: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const {
    user,
    isPremium,
    quizzesRemaining,
    updateDisplayName,
    updateProfileImage,
  } = useUser();
  const { getQuizById } = useQuiz();
  const { isAuthenticated, user: authUser, signOut } = useAuth();
  const { t } = useLanguage();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user.displayName);
  const [showCancelSubscription, setShowCancelSubscription] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting2, setIsDeleting2] = useState(false);
  const [fetchedQuizzes, setFetchedQuizzes] = useState<FetchedQuizzes>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    createdQuizzes: 0,
    totalLikes: 0,
    totalCompletions: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      try {
        // ユーザーが作成したクイズの統計を取得
        const { data: quizStats, error: statsError } = await supabase
          .from("quizzes")
          .select("id, likes, completions")
          .eq("created_by", authUser.id);

        if (statsError) throw statsError;

        const stats = {
          createdQuizzes: quizStats?.length || 0,
          totalLikes:
            quizStats?.reduce((sum, quiz) => sum + (quiz.likes || 0), 0) || 0,
          totalCompletions:
            quizStats?.reduce(
              (sum, quiz) => sum + (quiz.completions || 0),
              0
            ) || 0,
        };

        setUserStats(stats);

        // ユーザーのプロフィール画像はUserContextで管理されるため、ここでは取得しない
      } catch (error) {
        console.error("統計データの取得中にエラーが発生しました:", error);
      }
    };

    fetchUserStats();
  }, [authUser]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      console.log(
        "🔍 ProfilePage: fetchQuizzes called, quizResults length:",
        user.quizResults.length
      );

      if (!user.quizResults.length) {
        console.log(
          "🔍 ProfilePage: No quiz results, setting loading to false"
        );
        setIsLoading(false);
        return;
      }

      try {
        const quizIds = [
          ...new Set(user.quizResults.map((result) => result.quizId)),
        ];
        console.log("🔍 ProfilePage: Quiz IDs to fetch:", quizIds);

        const quizzes: FetchedQuizzes = {};

        await Promise.all(
          quizIds.map(async (quizId) => {
            console.log("🔍 ProfilePage: Fetching quiz:", quizId);
            const quiz = await getQuizById(quizId);
            if (quiz) {
              console.log(
                "🔍 ProfilePage: Quiz fetched successfully:",
                quiz.title
              );
              quizzes[quizId] = {
                title: quiz.title,
                results: quiz.results,
                createdBy: quiz.createdBy,
              };
            } else {
              console.log("🔍 ProfilePage: Quiz not found:", quizId);
            }
          })
        );

        console.log("🔍 ProfilePage: All quizzes fetched:", quizzes);
        setFetchedQuizzes(quizzes);
      } catch (error) {
        console.error("相談データの取得中にエラーが発生しました:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [user.quizResults, getQuizById]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthPrompt
          title={t("profileLoginRequired")}
          message={t("profileLoginMessage")}
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  const handleSaveDisplayName = () => {
    if (typeof newDisplayName === "string" && newDisplayName.trim()) {
      updateDisplayName(newDisplayName.trim());
      setIsEditing(false);
    }
  };

  const handleProfileImageChange = async (imageUrl: string) => {
    try {
      await updateProfileImage(imageUrl);
    } catch (error) {
      console.error("プロフィール画像の更新に失敗しました:", error);
      alert(t("profileImageUpdateError"));
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.displayName) {
      return;
    }

    setIsDeleting2(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("認証エラー");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(t("accountDeleteError"));
      }

      await signOut();
      navigate("/");
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      alert(t("accountDeleteError"));
    } finally {
      setIsDeleting2(false);
    }
  };

  // サブスクリプション解約
  const handleCancelSubscription = async () => {
    if (!confirm(t("cancelSubscriptionConfirm"))) return;

    try {
      const userId = authUser?.id;
      if (!userId) throw new Error(t("userIdError"));

      // シンプルに相対パスのみ使用
      const apiUrl = "/.netlify/functions/cancel-subscription";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        alert(t("subscriptionCancelled"));
        window.location.reload();
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (err) {
      alert(t("cancelSubscriptionError"));
      console.error(err);
    }
  };

  // Stripe Checkout連携
  const handlePremiumClick = async () => {
    try {
      const userId = authUser?.id;
      if (!userId) throw new Error(t("userIdError"));

      // シンプルに相対パスのみ使用
      const apiUrl = "/.netlify/functions/create-checkout";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      alert(t("paymentError"));
      console.error(err);
    }
  };

  const sortedResults = [...user.quizResults].sort((a, b) => {
    return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4">
      {/* ヘッダーセクション */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <ProfileAvatar
              displayName={user.displayName}
              profileImageUrl={user.profileImageUrl}
              size="xl"
              editable={true}
              onImageChange={handleProfileImageChange}
            />
            {isPremium && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5">
                <Crown className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="input text-xl font-bold px-3 py-1"
                    placeholder={t("displayNamePlaceholder")}
                    maxLength={30}
                  />
                  <button
                    onClick={handleSaveDisplayName}
                    className="btn-primary p-2"
                    title={t("save")}
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewDisplayName(user.displayName);
                    }}
                    className="btn-outline p-2"
                    title={t("cancel")}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{user.displayName}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-primary-600 p-1"
                    title={t("editName")}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </>
              )}
              {isPremium && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              {t("todayConsultationTickets").replace(
                "{count}",
                quizzesRemaining.toString()
              )}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="btn-outline flex items-center text-gray-600 hover:text-gray-800"
              >
                <Settings className="h-4 w-4 mr-1.5" />
                {t("settings")}
              </button>
              {!isPremium && (
                <button
                  onClick={handlePremiumClick}
                  className="btn-primary flex items-center text-sm"
                >
                  <Gift className="h-4 w-4 mr-1.5" />
                  {t("premiumRegistration")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("settings")}
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label={t("close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {t("accountManagement")}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {t("accountDeleteWarning")}
                </p>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setIsDeleting(true);
                  }}
                  className="w-full btn-outline flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
                  disabled={isDeleting2}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {isDeleting2 ? t("deleting") : t("deleteAccount")}
                </button>
              </div>

              {isPremium && (
                <div className="pt-2">
                  <button
                    onClick={() => setShowCancelSubscription(true)}
                    className="w-full btn-outline flex items-center justify-center text-orange-600 hover:bg-orange-50 hover:border-orange-200"
                    disabled={isDeleting2}
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    {isDeleting2 ? t("cancelling") : t("cancelSubscription")}
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full btn-primary"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アカウント削除 */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {t("accountDeleteConfirmation")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("accountDeleteDescription")}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("confirmDisplayName").replace("{name}", user.displayName)}
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="input"
                placeholder={user.displayName}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleteConfirmation !== user.displayName || isDeleting2
                }
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isDeleting2 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("deleting")}
                  </>
                ) : (
                  t("accountDeleteButton")
                )}
              </button>
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteConfirmation("");
                }}
                className="btn-outline"
                disabled={isDeleting2}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* サブスク解除確認 */}
      {showCancelSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {t("subscriptionCancelConfirmation")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("subscriptionCancelDescription")}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={isDeleting2}
                className="btn-primary bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isDeleting2 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("cancelling")}
                  </>
                ) : (
                  t("subscriptionCancelButton")
                )}
              </button>
              <button
                onClick={() => setShowCancelSubscription(false)}
                className="btn-outline"
                disabled={isDeleting2}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ログインストリーク表示 */}
      <div className="mb-8">
        <LoginStreakDisplay
          consecutiveLoginDays={user.consecutiveLoginDays}
          lastLoginDate={user.lastLoginDate}
        />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-start">
            <div className="bg-primary-100 rounded-full p-3">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {t("createdConsultations")}
              </h3>
              <p className="text-3xl font-bold text-primary-600 mt-1">
                {userStats.createdQuizzes}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-start">
            <div className="bg-secondary-100 rounded-full p-3">
              <History className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">
                {t("answeredConsultations")}
              </h3>
              <p className="text-3xl font-bold text-secondary-600 mt-1">
                {sortedResults.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-start">
            <div className="bg-yellow-100 rounded-full p-3">
              <Heart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">{t("totalLikes")}</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {userStats.totalLikes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 相談履歴 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">{t("consultationHistory")}</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loadingHistory")}</p>
          </div>
        ) : sortedResults.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {sortedResults.slice(0, displayCount).map((result) => {
              const quiz = fetchedQuizzes[result.quizId];
              if (!quiz) return null;

              const quizResult = quiz.results.find(
                (r) => r.id === result.resultId
              );
              if (!quizResult) return null;

              const isCreator = quiz.createdBy === authUser?.id;

              return (
                <div
                  key={result.takenAt}
                  className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(
                      `/results/${result.quizId}?result=${result.resultId}`
                    )
                  }
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-primary-600">
                          {t("result")}: {quizResult.title}
                        </p>
                      </div>

                      {quizResult.recommendedAction && (
                        <div
                          className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg cursor-help w-fit"
                          title={quizResult.recommendedAction}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-primary-600 text-sm mt-0.5 flex-shrink-0">
                              💡
                            </span>
                            <p className="text-xs text-primary-700 leading-relaxed">
                              {quizResult.recommendedAction.length > 40
                                ? `${quizResult.recommendedAction.substring(
                                    0,
                                    40
                                  )}...`
                                : quizResult.recommendedAction}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 作成者情報と日時 */}
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                          <span>
                            {t("creator")}:{" "}
                            {isCreator ? user.displayName : t("guestUser")}
                          </span>
                          <span className="hidden md:inline">
                            {formatDate(result.takenAt)}
                          </span>
                          <span className="md:hidden mt-1">
                            {formatDate(result.takenAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 self-center">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
            {displayCount < sortedResults.length && (
              <div className="p-4 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + 5)}
                  className="btn-outline text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                >
                  {t("showMore")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("noHistoryYet")}
            </h3>
            <p className="text-gray-600 mb-6">{t("noHistoryDescription")}</p>
            <button
              onClick={() => navigate("/explore")}
              className="btn-primary"
            >
              {t("findConsultations")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
