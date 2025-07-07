import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  Share2,
  Save,
  ArrowRight,
  Star,
  Users,
  ThumbsUp,
  Wand2,
  Heart,
  CheckCircle,
} from "lucide-react";
import { useQuiz } from "../contexts/QuizContext";
import { useAuth } from "../contexts/AuthContext";
import ShareButtons from "../components/ui/ShareButtons";
import ShareMetaTags from "../components/ui/ShareMetaTags";
import { imageService } from "../services/imageService";
// import ProductRecommendations from "../components/amazon/ProductRecommendations";
import Toast from "../components/ui/Toast";
import { ShareMetadata, Quiz, QuizResult } from "../types";
import { supabase } from "../lib/supabase";
import QuizConfirmModal from "../components/ui/QuizConfirmModal";
import ImageModal from "../components/ui/ImageModal";

const ResultsPage = () => {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get("result");
  const navigate = useNavigate();

  const { getQuizById, refreshQuizzes, getLikeCount } = useQuiz();
  const { user: authUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareMetadata, setShareMetadata] = useState<ShareMetadata | null>(
    null
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  // テンプレート保存状態を管理する新しいstate
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      if (!quizId || !resultId) {
        setError("URLが無効です");
        setIsLoading(false);
        return;
      }

      try {
        const loadedQuiz = await getQuizById(quizId);
        if (!loadedQuiz) {
          setError("クイズが見つかりませんでした");
          setIsLoading(false);
          return;
        }

        setQuiz(loadedQuiz);
        // 初期のいいね数を正確に取得
        const initialLikeCount = await getLikeCount(quizId);
        setLikeCount(initialLikeCount);
        // クイズのテンプレート状態を初期化
        setIsTemplateSaved(loadedQuiz.isTemplate === true);

        // クイズの結果を取得
        const { data: resultData, error: resultError } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("id", resultId)
          .eq("quiz_id", quizId)
          .single();

        if (resultError || !resultData) {
          setError("相談結果が見つかりませんでした");
          setIsLoading(false);
          return;
        }

        const loadedResult: QuizResult = {
          id: resultData.id,
          title: resultData.title,
          description: resultData.description,
          imageUrl: resultData.image_url,
        };

        setResult(loadedResult);

        const generatedImage = await imageService.generateAdvancedShareImage({
          appTitle: "AIだけど相談ある？",
          quizTitle: loadedQuiz.title,
          resultTitle: loadedResult.title,
          resultDescription: loadedResult.description,
        });
        setGeneratedImageUrl(generatedImage);

        setShareMetadata({
          title: `${loadedResult.title} - ${loadedQuiz.title}`,
          description: loadedResult.description,
          imageUrl: generatedImage,
          url: `${window.location.origin}/d/${
            loadedQuiz.templateId || loadedQuiz.id
          }`,
        });

        // ユーザーがログインしている場合、いいね状態を確認
        if (authUser) {
          await checkLikeStatus(quizId);
        }
      } catch (err) {
        console.error("Error loading quiz result:", err);
        setError("相談結果の読み込み中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadResult();
  }, [quizId, resultId, getQuizById, authUser]);

  // リアルタイムでquiz_likesの変化を監視し、即時likeCountを更新
  useEffect(() => {
    if (!quizId) return;

    const channel = supabase
      .channel("quiz_likes_results")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_likes",
          filter: `quiz_id=eq.${quizId}`,
        },
        async () => {
          // 共通関数でいいね数を再取得
          const newCount = await getLikeCount(quizId);
          setLikeCount(newCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId, getLikeCount]);

  const checkLikeStatus = async (quizId: string) => {
    if (!authUser) return;

    try {
      const { data, error } = await supabase
        .from("quiz_likes")
        .select("id")
        .eq("quiz_id", quizId)
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking like status:", error);
        return;
      }

      setHasLiked(!!data);
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };

  const handleLike = async () => {
    if (!authUser || !quiz || isLiking) {
      if (!authUser) {
        setToast({ message: "いいねするにはログインが必要です", type: "info" });
      }
      return;
    }

    setIsLiking(true);

    try {
      console.log("=== LIKE OPERATION START ===");
      console.log("User ID:", authUser.id);
      console.log("Quiz ID:", quiz.id);
      console.log("Current likes:", likeCount);

      if (hasLiked) {
        // いいねを取り消す
        const { error: deleteError } = await supabase
          .from("quiz_likes")
          .delete()
          .eq("quiz_id", quiz.id)
          .eq("user_id", authUser.id);

        if (deleteError) throw deleteError;

        setHasLiked(false);
        setToast({ message: "いいねを取り消しました", type: "info" });
        console.log("Like removed");
      } else {
        // いいねを追加する
        const { error: insertError } = await supabase
          .from("quiz_likes")
          .insert({
            quiz_id: quiz.id,
            user_id: authUser.id,
          });

        if (insertError) throw insertError;

        setHasLiked(true);
        setToast({ message: "いいねしました", type: "success" });
        console.log("Like added");
      }

      // 共通関数でいいね数を再取得
      const newLikeCount = await getLikeCount(quiz.id);
      console.log("Updated quiz likes:", newLikeCount);
      setLikeCount(newLikeCount);

      console.log("=== LIKE OPERATION END ===");
    } catch (err) {
      console.error("Error in handleLike:", err);
      setToast({
        message: "いいねの処理中にエラーが発生しました",
        type: "error",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleStartQuiz = () => {
    if (!quizId) return;

    // 確認モーダルを表示
    setShowConfirmModal(true);
  };

  const handleConfirmStartQuiz = () => {
    if (!quizId) return;

    // 確認済みフラグを付けて診断ページに遷移
    navigate(`/quiz/${quizId}`, {
      state: { confirmedStart: true },
    });
    setShowConfirmModal(false);
  };

  const handleSaveTemplate = async () => {
    if (!quiz || !authUser?.id) return;

    setIsSaving(true);

    try {
      // 今見ているクイズをテンプレート化
      const { error } = await supabase
        .from("quizzes")
        .update({ is_template: true })
        .eq("id", quiz.id)
        .eq("created_by", authUser.id);

      if (error) throw error;

      setToast({ message: "テンプレートとして保存しました", type: "success" });

      // クイズデータを再取得してisTemplateを最新化
      const updatedQuiz = await getQuizById(quiz.id);
      if (updatedQuiz) setQuiz(updatedQuiz);

      await refreshQuizzes();
    } catch (err) {
      console.error("Error saving template:", err);
      setToast({
        message: "テンプレートの保存中にエラーが発生しました",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600">診断結果を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8">
          <h1 className="text-2xl font-semibold text-red-800 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !result) return null;

  // ユーザーIDと診断の作成者IDを比較
  const isQuizCreator = authUser?.id && quiz.createdBy === authUser.id;
  // クイズがすでにテンプレートとして保存されているかチェック
  const isAlreadyTemplate = quiz.isTemplate === true;

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* 動的メタタグ設定 */}
      <ShareMetaTags metadata={shareMetadata} />

      {/* クイズ情報 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-gray-600">{quiz.description}</p>

        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-1" />
            <span>{quiz.completions}回相談</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ThumbsUp className="h-5 w-5 mr-1" />
            <span>{likeCount}いいね</span>
          </div>

          {/* いいねボタン */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`
              flex items-center px-4 py-2 rounded-lg transition-all
              ${
                hasLiked
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
              }
              ${isLiking ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <Heart
              className={`h-5 w-5 mr-1 transition-all ${
                hasLiked ? "fill-current text-red-600" : ""
              }`}
            />
            <span className="text-sm font-medium">
              {isLiking ? "..." : hasLiked ? "いいね済み" : "いいね"}
            </span>
          </button>
        </div>
      </div>

      {/* 診断結果カード */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-6 flex items-center">
          <div className="bg-white/20 rounded-full p-3">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4 text-white">
            <h2 className="text-xl font-bold">あなたの相談結果</h2>
            <p className="text-white/80 text-sm">
              質問から導き出された回答です
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={generatedImageUrl || ""}
                  alt={result.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                />
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {result.title}
                </h3>
              </div>

              <div className="prose prose-lg text-gray-700 mb-6">
                <p className="leading-relaxed whitespace-pre-line">
                  {result.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={handleStartQuiz}
                  className="btn-primary flex items-center"
                >
                  もう一度診断する
                </button>

                <button
                  onClick={() => navigate("/create")}
                  className="btn-outline flex items-center"
                >
                  {isQuizCreator ? (
                    <>
                      <Wand2 className="h-5 w-5 mr-2" />
                      他のことを相談する
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5 mr-2" />
                      自分で相談してみる
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 一時的にAmazon商品セクションを非表示（2024/07/03 検証のため） */}
      {/* <ProductRecommendations keywords={`${result.title} ${quiz.title}`} /> */}

      {/* シェアとテンプレート保存 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-primary-600" />
              結果をシェアする
            </h3>
            <p className="text-gray-600 mb-6">友達や家族と共有しましょう！</p>

            {shareMetadata && <ShareButtons {...shareMetadata} />}
          </div>
        </div>

        {isQuizCreator && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Save className="h-5 w-5 mr-2 text-primary-600" />
                テンプレートとして保存
              </h3>
              <p className="text-gray-600 mb-6">
                {isAlreadyTemplate
                  ? "この相談はすでにテンプレートとして保存されており、見つける画面で他のユーザーが利用できます。"
                  : "この相談をテンプレートとして保存し、見つける画面で他のユーザーが利用できるようにします。"}
              </p>

              {isAlreadyTemplate ? (
                <div className="flex items-center justify-center w-full py-3 px-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">すでに保存されています</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveTemplate}
                  disabled={isSaving || isTemplateSaved}
                  className={`w-full flex items-center justify-center group py-3 px-4 rounded-lg transition-colors ${
                    isSaving || isTemplateSaved
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      保存中...
                    </>
                  ) : (
                    <>
                      テンプレートとして保存
                      <ArrowRight className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <QuizConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmStartQuiz}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={generatedImageUrl}
      />
    </div>
  );
};

export default ResultsPage;
