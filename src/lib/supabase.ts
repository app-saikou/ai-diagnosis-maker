import { createClient } from "@supabase/supabase-js";

// デバッグ用: 環境変数の値をコンソールに出力
console.log("🔍 Environment variables check:");
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "VITE_SUPABASE_ANON_KEY:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "SET" : "NOT SET"
);
console.log("NODE_ENV:", import.meta.env.NODE_ENV);

// 環境変数の取得（フォールバック付き）
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://twzhqyxllwrupsqzrprr.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3emhxeXhsbHdydXBzcXpycHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzQxODksImV4cCI6MjA2MzYxMDE4OX0.C-LoCT-4zbQeghzYaOiJGJo5UqXXaGH2fpxJU5VElSM";

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
