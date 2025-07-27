import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { useUser } from "./UserContext";
import { supabase } from "../lib/supabase";
import { aiService } from "../services/aiService";
import { Quiz, QuizMode, QuizModeConfig, QuizResult } from "../types";

interface QuizContextType {
  quizModes: Record<QuizMode, QuizModeConfig>;
  currentQuiz: Quiz | null;
  quizzes: Quiz[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
  generateQuiz: (title: string, mode: QuizMode) => Promise<Quiz>;
  generateResults: () => Promise<QuizResult[]>;
  saveQuiz: () => Promise<void>;
  getQuizById: (id: string) => Promise<Quiz | undefined>;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setCurrentQuestionIndex: (index: number) => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  clearAnswers: () => void;
  resetQuiz: () => void;
  incrementQuizCount: () => void;
  refreshQuizzes: () => Promise<void>;
  getLikeCount: (quizId: string) => Promise<number>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { incrementQuizCount } = useUser();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quizModes: Record<QuizMode, QuizModeConfig> = {
    quick: {
      name: t("quickMode"),
      questionCount: 3,
      availableToFree: true,
    },
    standard: {
      name: t("standardMode"),
      questionCount: 5,
      availableToFree: true,
    },
    deep: {
      name: t("deepMode"),
      questionCount: 7,
      availableToFree: false,
    },
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      console.log("Loading quizzes from Supabase...");

      const { data: quizzesData, error: quizzesError } = await supabase
        .from("quizzes")
        .select(
          `
          id,
          title,
          description,
          created_by,
          is_template,
          template_id,
          completions,
          likes,
          created_at,
          creator:users!created_by(display_name),
          questions:quiz_questions(
            id,
            text,
            order,
            options:quiz_options(
              id,
              text,
              points
            )
          ),
          results:quiz_results(
            id,
            title,
            description,
            image_url
          )
        `
        )
        .eq("is_template", true) // テンプレートとして保存されたクイズのみを取得
        .order("created_at", { ascending: false });

      if (quizzesError) {
        console.error("Supabase error:", quizzesError);
        throw quizzesError;
      }

      const formattedQuizzes: Quiz[] = quizzesData.map((quiz: any) => {
        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          createdAt: quiz.created_at,
          createdBy: quiz.created_by,
          creatorDisplayName: quiz.creator?.display_name || t("guestUser"),
          isTemplate: quiz.is_template,
          templateId: quiz.template_id,
          completions: quiz.completions || 0, // デフォルト値を確実に設定
          likes: quiz.likes || 0, // デフォルト値を確実に設定
          questions: (quiz.questions as any[]).map((q) => ({
            id: q.id,
            text: q.text,
            order: q.order,
            options: (q.options as any[]).map((o) => ({
              id: o.id,
              text: o.text,
              points: o.points,
            })),
          })),
          results: (quiz.results as any[]).map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            imageUrl: r.image_url,
          })),
          tags: [],
        };
      });

      // クイズリスト取得後、各クイズごとにlikesをquiz_likesの件数で上書き
      const updatedQuizzes = await Promise.all(
        formattedQuizzes.map(async (quiz) => {
          const { count } = await supabase
            .from("quiz_likes")
            .select("*", { count: "exact", head: true })
            .eq("quiz_id", quiz.id);
          return { ...quiz, likes: count || 0 };
        })
      );

      setQuizzes(updatedQuizzes);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      setError(t("quizLoadingError"));
    } finally {
      setIsLoading(false);
    }
  };

  // クイズリストを手動で更新する関数
  const refreshQuizzes = async () => {
    console.log("Refreshing quizzes...");
    console.log("Current user:", user?.id);

    // 強制的に状態をクリアしてから再取得
    setQuizzes([]);
    console.log("Quizzes state cleared");

    // 強制的にキャッシュをクリアするため、少し待ってから再取得
    await new Promise((resolve) => setTimeout(resolve, 50));

    await loadQuizzes();

    console.log("Refresh completed. Current quizzes count:", quizzes.length);
  };

  const generateQuiz = async (title: string, mode: QuizMode): Promise<Quiz> => {
    if (!title.trim()) {
      throw new Error(t("quizTitleRequired"));
    }

    setIsGenerating(true);
    setError(null);

    try {
      const questionCount = quizModes[mode].questionCount;
      const newQuiz = await aiService.generateQuiz(title, questionCount);

      if (!newQuiz || !newQuiz.questions || newQuiz.questions.length === 0) {
        throw new Error(t("quizGenerationFailed"));
      }

      // Save quiz to Supabase
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title: newQuiz.title,
          description: newQuiz.description,
          created_by: user?.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Save questions and collect their IDs
      const questionPromises = newQuiz.questions.map(
        async (question, index) => {
          const { data: q, error: questionError } = await supabase
            .from("quiz_questions")
            .insert({
              quiz_id: quiz.id,
              text: question.text,
              order: index,
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Save options for this question
          const optionPromises = question.options.map((option) =>
            supabase
              .from("quiz_options")
              .insert({
                question_id: q.id,
                text: option.text,
                points: option.points,
              })
              .select()
              .single()
          );

          await Promise.all(optionPromises);
          return q;
        }
      );

      await Promise.all(questionPromises);

      // Fetch the complete quiz with all related data
      const generatedQuiz = await getQuizById(quiz.id);
      if (!generatedQuiz) {
        throw new Error(t("quizGenerationError"));
      }

      setCurrentQuiz(generatedQuiz);
      setAnswers({});
      setCurrentQuestionIndex(0);

      return generatedQuiz;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("quizGenerationError");
      setError(errorMessage);
      setCurrentQuiz(null);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateResults = async (): Promise<QuizResult[]> => {
    if (!currentQuiz) {
      throw new Error(t("quizNotSelected"));
    }

    try {
      const results = await aiService.generateResults(
        currentQuiz.title,
        currentQuiz.questions,
        answers
      );

      // Save results to Supabase and collect the generated IDs
      const savedResults = await Promise.all(
        results.map(async (result) => {
          const { data, error } = await supabase
            .from("quiz_results")
            .insert({
              quiz_id: currentQuiz.id,
              title: result.title,
              description: result.description,
              recommended_action: result.recommendedAction,
              image_url: result.imageUrl,
            })
            .select()
            .single();

          if (error) throw error;

          // Return the result with the Supabase-generated ID
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            recommendedAction: result.recommendedAction,
            imageUrl: data.image_url,
          };
        })
      );

      // Update current quiz with the saved results that have proper Supabase IDs
      setCurrentQuiz((prev) =>
        prev ? { ...prev, results: savedResults } : null
      );

      return savedResults;
    } catch (err) {
      console.error("Error generating results:", err);
      throw new Error(t("quizResultGenerationError"));
    }
  };

  const saveQuiz = async () => {
    if (!currentQuiz || !user) return;

    try {
      const { error } = await supabase
        .from("quizzes")
        .update({
          title: currentQuiz.title,
          description: currentQuiz.description,
          is_template: currentQuiz.isTemplate,
          template_id: currentQuiz.templateId,
        })
        .eq("id", currentQuiz.id)
        .eq("created_by", user.id);

      if (error) throw error;

      await loadQuizzes();
    } catch (err) {
      console.error("Error saving quiz:", err);
      throw err;
    }
  };

  const getQuizById = async (id: string): Promise<Quiz | undefined> => {
    try {
      const { data: quiz, error } = await supabase
        .from("quizzes")
        .select(
          `
          *,
          creator:users!created_by(display_name),
          questions:quiz_questions(
            id,
            text,
            order,
            options:quiz_options(
              id,
              text,
              points
            )
          ),
          results:quiz_results(
            id,
            title,
            description,
            recommended_action,
            image_url
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;

      // If no quiz found, return undefined
      if (!quiz) {
        console.log(`Quiz with ID ${id} not found`);
        return undefined;
      }

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        createdAt: quiz.created_at,
        createdBy: quiz.created_by,
        creatorDisplayName: quiz.creator?.display_name || t("guestUser"),
        isTemplate: quiz.is_template,
        templateId: quiz.template_id,
        completions: quiz.completions || 0,
        likes: quiz.likes || 0,
        questions: (quiz.questions as any[]).map((q) => ({
          id: q.id,
          text: q.text,
          order: q.order,
          options: (q.options as any[]).map((o) => ({
            id: o.id,
            text: o.text,
            points: o.points,
          })),
        })),
        results: (quiz.results as any[]).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          recommendedAction: r.recommended_action || undefined,
          imageUrl: r.image_url,
        })),
        tags: [],
      };
    } catch (err) {
      console.error("Error getting quiz:", err);
      return undefined;
    }
  };

  const answerQuestion = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const clearAnswers = () => {
    setAnswers({});
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setError(null);
  };

  const getLikeCount = async (quizId: string): Promise<number> => {
    try {
      const { count } = await supabase
        .from("quiz_likes")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId);
      return count || 0;
    } catch (err) {
      console.error("Error getting like count:", err);
      return 0;
    }
  };

  return (
    <QuizContext.Provider
      value={{
        quizModes,
        currentQuiz,
        quizzes,
        currentQuestionIndex,
        answers,
        isGenerating,
        isLoading,
        error,
        generateQuiz,
        generateResults,
        saveQuiz,
        getQuizById,
        setCurrentQuiz,
        setCurrentQuestionIndex,
        answerQuestion,
        clearAnswers,
        resetQuiz,
        incrementQuizCount,
        refreshQuizzes,
        getLikeCount,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
