import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { User } from "../types";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";
import LoadingOverlay from "../components/ui/LoadingOverlay";

interface UserContextType {
  user: User;
  isPremium: boolean;
  canTakeQuiz: boolean;
  quizzesRemaining: number;
  dailyLimit: number;
  timeToNextReset: string;
  setIsPremium: (value: boolean) => void;
  incrementQuizCount: () => void;
  saveQuizResult: (
    quizId: string,
    resultId: string,
    answers: Record<string, string>
  ) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
}

const defaultUser: User = {
  isPremium: false,
  quizzesTakenToday: 0,
  quizResults: [],
  lastReset: new Date().toISOString().split("T")[0],
  displayName: "ゲストユーザー",
  consecutiveLoginDays: 1,
  lastLoginDate: new Date().toISOString().split("T")[0],
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    isAuthenticated,
    user: authUser,
    isLoading: authIsLoading,
  } = useAuth();
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);
  const [timeToNextReset, setTimeToNextReset] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);

  const isPremium = user.isPremium;
  const dailyLimit = isPremium ? 30 : 3;
  const quizzesRemaining = Math.max(0, dailyLimit - user.quizzesTakenToday);
  const canTakeQuiz = quizzesRemaining > 0;

  // 次のリセット時刻までの残り時間を計算する関数
  const calculateTimeToNextReset = useCallback(() => {
    const now = new Date();
    const jstNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
    );
    const nextMidnight = new Date(jstNow);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);
    const timeDiff = nextMidnight.getTime() - jstNow.getTime();

    if (timeDiff <= 0) {
      return "まもなくリセットされます";
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `あと${hours}時間${minutes}分でリセットされます`;
    } else {
      return `あと${minutes}分でリセットされます`;
    }
  }, []);

  // 1分ごとに残り時間を更新
  useEffect(() => {
    const updateResetTime = () => {
      setTimeToNextReset(calculateTimeToNextReset());
    };

    updateResetTime();
    const interval = setInterval(updateResetTime, 60000);
    return () => clearInterval(interval);
  }, [calculateTimeToNextReset]);

  // ユーザーデータをロードする関数（useCallbackでメモ化）
  const loadUserData = useCallback(async () => {
    console.log("🔄 UserContext: loadUserData function called");
    console.log("📊 UserContext: Current state check:", {
      authIsLoading,
      isAuthenticated,
      authUserId: authUser?.id || "No auth user",
    });

    // AuthContextがまだロード中の場合は早期リターン（setIsLoadingを呼ばない）
    if (authIsLoading) {
      console.log("⏸️ UserContext: AuthContext is still loading, waiting...");
      return;
    }

    console.log(
      "⏳ UserContext: Setting isLoading to TRUE (loadUserData start)"
    );
    setIsLoading(true);

    try {
      // 認証されていない場合はデフォルトユーザーを使用
      if (!isAuthenticated || !authUser) {
        console.log(
          "👤 UserContext: User not authenticated, using default user"
        );
        // 現在のユーザーがdefaultUserと異なる場合のみ更新
        setUser((prevUser) => {
          if (JSON.stringify(prevUser) !== JSON.stringify(defaultUser)) {
            console.log("📊 UserContext: Setting default user data");
            return defaultUser;
          }
          return prevUser;
        });
        return;
      }

      console.log(
        "🔍 UserContext: Loading user data for authenticated user:",
        authUser.id
      );

      // 少し待機してからユーザーデータを読み込み（Supabaseの同期を待つ）
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ユーザーデータを読み込み
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error(
          "❌ UserContext: Error fetching user data from Supabase:",
          error
        );
        throw error;
      }

      if (!userData) {
        console.log(
          "👤 UserContext: User data not found in DB, setting default user"
        );
        const isAnonymous = authUser.is_anonymous || false;
        const defaultUserForAuth = {
          ...defaultUser,
          displayName: isAnonymous ? "ゲストユーザー" : defaultUser.displayName,
        };
        setUser(defaultUserForAuth);
      } else {
        console.log("📊 UserContext: User data loaded from DB:", userData);
        const loadedUser = {
          isPremium: userData.is_premium || false,
          quizzesTakenToday: userData.quizzes_taken_today || 0,
          lastReset: userData.last_reset || defaultUser.lastReset,
          displayName: userData.display_name || defaultUser.displayName,
          consecutiveLoginDays: userData.consecutive_login_days || 1,
          lastLoginDate: userData.last_login_date || defaultUser.lastLoginDate,
          quizResults: [],
        };
        setUser(loadedUser);
      }

      // クイズ結果をロード
      const { data: results, error: resultsError } = await supabase
        .from("user_quiz_results")
        .select("quiz_id, result_id, answers, taken_at")
        .eq("user_id", authUser.id)
        .order("taken_at", { ascending: false });

      if (resultsError && resultsError.code !== "PGRST116") {
        console.error(
          "❌ UserContext: Error loading quiz results:",
          resultsError
        );
        throw resultsError;
      }

      if (results) {
        console.log(
          "📊 UserContext: Setting quiz results, count:",
          results.length
        );
        setUser((prev) => ({
          ...prev,
          quizResults: results.map((result) => ({
            quizId: result.quiz_id,
            resultId: result.result_id,
            answers: result.answers,
            takenAt: result.taken_at,
          })),
        }));
      }

      console.log("✅ UserContext: User data loading completed successfully");
    } catch (err) {
      console.error("💥 UserContext: Caught error during loadUserData:", err);
      // エラーが発生した場合はデフォルト値を使用
      setUser(defaultUser);
    } finally {
      console.log(
        "✅ UserContext: Setting isLoading to FALSE (loadUserData finally block)"
      );
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [authIsLoading, isAuthenticated, authUser]);

  // AuthContextの状態が変更された時にユーザーデータをロード
  useEffect(() => {
    console.log("🚀 UserContext: useEffect triggered with dependencies:", {
      authIsLoading,
      isAuthenticated,
      authUserId: authUser?.id || "No auth user",
    });

    // AuthContextがロード中でない場合のみloadUserDataを実行
    if (!authIsLoading) {
      console.log("🔄 UserContext: Starting loadUserData...");
      loadUserData();
    }
  }, [authIsLoading, isAuthenticated, authUser?.id, loadUserData]);

  const setIsPremium = useCallback(
    async (value: boolean) => {
      console.log("💎 UserContext: setIsPremium called with value:", value);
      if (!isAuthenticated || !authUser) {
        console.log("⏸️ UserContext: setIsPremium - user not authenticated");
        return;
      }

      try {
        const { error } = await supabase.from("users").upsert(
          {
            id: authUser.id,
            is_premium: value,
          },
          {
            onConflict: "id",
            ignoreDuplicates: false,
          }
        );

        if (error) {
          console.error(
            "❌ UserContext: Error updating premium status:",
            error
          );
          throw error;
        }

        setUser((prev) => ({ ...prev, isPremium: value }));
      } catch (err) {
        console.error("💥 UserContext: Error updating premium status:", err);
      }
    },
    [isAuthenticated, authUser]
  );

  const incrementQuizCount = useCallback(async () => {
    console.log("📈 UserContext: incrementQuizCount called");
    if (!isAuthenticated || !authUser) {
      console.log(
        "⏸️ UserContext: incrementQuizCount - user not authenticated"
      );
      return;
    }

    try {
      const newCount = user.quizzesTakenToday + 1;

      const { error } = await supabase.from("users").upsert(
        {
          id: authUser.id,
          quizzes_taken_today: newCount,
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        }
      );

      if (error) {
        console.error("❌ UserContext: Error incrementing quiz count:", error);
        throw error;
      }

      setUser((prev) => ({
        ...prev,
        quizzesTakenToday: newCount,
      }));
    } catch (err) {
      console.error("💥 UserContext: Error incrementing quiz count:", err);
    }
  }, [isAuthenticated, authUser, user.quizzesTakenToday]);

  const saveQuizResult = useCallback(
    async (
      quizId: string,
      resultId: string,
      answers: Record<string, string>
    ) => {
      console.log("💾 UserContext: saveQuizResult called");
      if (!isAuthenticated || !authUser) {
        console.log("⏸️ UserContext: saveQuizResult - user not authenticated");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_quiz_results")
          .insert({
            user_id: authUser.id,
            quiz_id: quizId,
            result_id: resultId,
            answers: answers,
          });

        if (error) {
          console.error("❌ UserContext: Error saving quiz result:", error);
          throw error;
        }

        console.log("✅ UserContext: Quiz result saved:", data);
      } catch (err) {
        console.error("💥 UserContext: Error saving quiz result:", err);
      }
    },
    [isAuthenticated, authUser]
  );

  const updateDisplayName = useCallback(
    async (name: string) => {
      console.log(
        `✏️ UserContext: updateDisplayName called with name: ${name}`
      );
      if (!isAuthenticated || !authUser) {
        console.log(
          "⏸️ UserContext: updateDisplayName - user not authenticated"
        );
        return;
      }

      try {
        const { error } = await supabase
          .from("users")
          .update({ display_name: name })
          .eq("id", authUser.id);

        if (error) {
          console.error("❌ UserContext: Error updating display name:", error);
          throw error;
        }

        setUser((prev) => ({ ...prev, displayName: name }));
      } catch (err) {
        console.error("💥 UserContext: Error updating display name:", err);
      }
    },
    [isAuthenticated, authUser]
  );

  // 現在の状態をログ出力（デバッグ用）
  console.log("📊 UserContext: Current state:", {
    authIsLoading,
    isLoading,
    isAuthenticated,
    authUserId: authUser?.id || "No auth user",
    userDisplayName: user.displayName,
    isPremium: user.isPremium,
    quizzesTakenToday: user.quizzesTakenToday,
    hasInitialized,
  });

  const value = useMemo(
    () => ({
      user,
      isPremium,
      canTakeQuiz,
      quizzesRemaining,
      dailyLimit,
      timeToNextReset,
      setIsPremium,
      incrementQuizCount,
      saveQuizResult,
      updateDisplayName,
    }),
    [
      user,
      isPremium,
      canTakeQuiz,
      quizzesRemaining,
      dailyLimit,
      timeToNextReset,
      setIsPremium,
      incrementQuizCount,
      saveQuizResult,
      updateDisplayName,
    ]
  );

  // AuthContextまたはUserContextがロード中の場合はローディング表示
  if (authIsLoading) {
    console.log(
      "⏳ UserContext: Showing loading overlay because authIsLoading is true"
    );
    return <LoadingOverlay />;
  }

  if (isLoading && !hasInitialized) {
    console.log(
      "⏳ UserContext: Showing loading overlay because isLoading is true and not initialized"
    );
    return <LoadingOverlay />;
  }

  console.log("✅ UserContext: Rendering children with user data:", {
    displayName: user.displayName,
    isPremium: user.isPremium,
    quizzesTakenToday: user.quizzesTakenToday,
    isAuthenticated,
  });

  if (isLoading || !hasInitialized) {
    return <LoadingOverlay message="ユーザー情報を読み込んでいます..." />;
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
