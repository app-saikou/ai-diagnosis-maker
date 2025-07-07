import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useLanguage } from "./LanguageContext";
import Toast from "../components/ui/Toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const getJSTDateString = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 540); // JST = UTC+9
  return now.toISOString().split("T")[0];
};

const buildProfileData = (user: User) => ({
  id: user.id,
  display_name: user.is_anonymous
    ? "ゲストユーザー"
    : user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "ゲストユーザー",
  profile_image_url: user.user_metadata?.avatar_url || null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const { t } = useLanguage();

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const upsertProfileIfNeeded = async (user: User) => {
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!data) {
      await supabase
        .from("users")
        .upsert(buildProfileData(user), { onConflict: "id" });
    }
  };

  useEffect(() => {
    console.log("Auth useEffect: start");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("onAuthStateChange event:", event, session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);

      // ローディングを先に止める
      setIsLoading(false);
      console.log("Auth useEffect: setIsLoading(false)");

      // DB更新処理のみ（トースト表示なし）
      if (session?.user) {
        supabase
          .from("users")
          .update({ last_login_date: getJSTDateString() })
          .eq("id", session.user.id)
          .then(() => console.log("last_login_date updated"))
          .catch((e: unknown) =>
            console.error("last_login_date update error:", e)
          );

        upsertProfileIfNeeded(session.user)
          .then(() => console.log("upsertProfileIfNeeded done"))
          .catch((e: unknown) =>
            console.error("upsertProfileIfNeeded error:", e)
          );
      }
    });

    return () => {
      subscription.unsubscribe();
      console.log("Auth useEffect: unsubscribed");
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setIsLoading(true);
    console.log("signUp: start");
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error || !user) throw error || new Error("登録に失敗しました");
      await upsertProfileIfNeeded(user);
      showToast("アカウントを作成しました", "success");
    } catch (error) {
      setError(error as AuthError);
      showToast(t("signUpFailed"), "error");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("signUp: setIsLoading(false)");
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("signIn: start");
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !user) throw error || new Error("ログインに失敗しました");
    } catch (error) {
      setError(error as AuthError);
      showToast(t("invalidCredentials"), "error");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("signIn: setIsLoading(false)");
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    console.log("signOut: start");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setError(error as AuthError);
      showToast("ログアウトに失敗しました", "error");
    } finally {
      setIsLoading(false);
      console.log("signOut: setIsLoading(false)");
    }
  };

  const continueAsGuest = async () => {
    setIsLoading(true);
    console.log("continueAsGuest: start");
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.signInAnonymously();
      if (error || !user)
        throw error || new Error("ゲストログインに失敗しました");
      await upsertProfileIfNeeded(user);
    } catch (error) {
      setError(error as AuthError);
      showToast("ゲストログインに失敗しました", "error");
      throw error;
    } finally {
      setIsLoading(false);
      console.log("continueAsGuest: setIsLoading(false)");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        continueAsGuest,
      }}
    >
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export { AuthContext };
