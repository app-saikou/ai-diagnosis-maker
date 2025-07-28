import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL 環境変数が設定されていません。Netlifyの環境変数設定を確認してください。"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY 環境変数が設定されていません。Netlifyの環境変数設定を確認してください。"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
