import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useQuiz } from "../contexts/QuizContext";
import { useUser } from "../contexts/UserContext";
import ProgressBar from "../components/ui/ProgressBar";
import QuizLeaveModal from "../components/ui/QuizLeaveModal";

const TakeQuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getQuizById,
    currentQuiz,
    setCurrentQuiz,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answerQuestion,
    clearAnswers,
    answers,
    generateResults,
  } = useQuiz();
  const { saveQuizResult, incrementQuizCount } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // 結果ページから遷移してきた場合の確認済みフラグをチェック
  const isConfirmedStart = location.state?.confirmedStart === true;

  useEffect(() => {
    console.log("useEffect発火:", {
      quizId,
      isConfirmedStart,
      currentQuiz: !!currentQuiz,
    });

    const loadQuiz = async () => {
      if (!quizId) {
        setIsLoadingQuiz(false);
        navigate("/", { replace: true });
        return;
      }

      setIsLoadingQuiz(true);

      try {
        // もう一度相談する時は、既存のクイズデータがあれば再利用
        if (isConfirmedStart && currentQuiz && currentQuiz.id === quizId) {
          console.log("既存の相談データを再利用");
          clearAnswers();
          setCurrentQuestionIndex(0);
          incrementQuizCount();
          setIsLoadingQuiz(false);
          return;
        }

        // 新しいクイズまたは異なるクイズの場合は取得
        const loadedQuiz = await getQuizById(quizId);
        if (!loadedQuiz) {
          setError("相談が見つかりませんでした");
          return;
        }
        setCurrentQuiz(loadedQuiz);
        clearAnswers();
        setCurrentQuestionIndex(0);
        incrementQuizCount();
      } catch {
        setError("相談の読み込み中にエラーが発生しました");
      } finally {
        setIsLoadingQuiz(false);
      }
    };

    loadQuiz();
  }, [quizId, isConfirmedStart, navigate, currentQuiz?.id]);

  // ブラウザの戻るボタンと手動のナビゲーションを処理
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  };

  useEffect(() => {
    // 相談が開始されている場合のみbeforeunloadイベントを設定
    if (currentQuiz && currentQuestionIndex >= 0) {
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [currentQuiz, currentQuestionIndex]);

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

  if (
    isLoadingQuiz ||
    !currentQuiz ||
    currentQuestionIndex < 0 ||
    !currentQuiz.questions
  ) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
          <p className="mt-4 text-gray-600">相談を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === currentQuiz.questions.length - 1;

  const handleNext = async () => {
    if (!currentQuestion) return;

    if (isLastQuestion) {
      setIsSubmitting(true);

      try {
        // Generate results based on user's answers
        const results = await generateResults();
        if (!results || results.length === 0) {
          throw new Error("相談結果の生成に失敗しました");
        }

        // Save the first result (most relevant one)
        const resultId = results[0].id;
        await saveQuizResult(currentQuiz.id, resultId, answers);

        // データベースの同期を待つために遅延を追加
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Navigate to results page
        navigate(`/results/${currentQuiz.id}?result=${resultId}`, {
          replace: true,
        });
      } catch (err) {
        console.error("Error finishing quiz:", err);
        setError("エラーが発生しました");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleLeaveConfirm = () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    navigate("/");
    setShowLeaveModal(false);
  };

  const handleOptionSelect = (optionId: string) => {
    if (!currentQuestion || isSubmitting) return;

    // 回答を記録
    answerQuestion(currentQuestion.id, optionId);

    // 短い遅延の後に次の質問に進む
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">
          {currentQuiz.title}
        </h1>
        <p className="text-gray-600 text-center">{currentQuiz.description}</p>
      </div>

      <ProgressBar
        current={currentQuestionIndex + 1}
        total={currentQuiz.questions.length}
      />

      {currentQuestion && (
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 transform scale-[1.02]"
                        : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
                    }
                    ${isSubmitting ? "pointer-events-none opacity-50" : ""}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{option.text}</p>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5 text-primary-600 animate-fade-in" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isSubmitting && isLastQuestion && (
            <div className="mt-6 flex items-center justify-center text-primary-600">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span>結果生成中...</span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className={`
            flex items-center px-6 py-3 rounded-lg transition-all
            ${
              currentQuestionIndex === 0 || isSubmitting
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
            }
          `}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          前の質問
        </button>
      </div>

      <QuizLeaveModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveConfirm}
      />
    </div>
  );
};

export default TakeQuizPage;
