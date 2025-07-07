import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("認証が必要です");
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Create Supabase client to verify the user's token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the user's token
    const {
      data: { user },
      error: verifyError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (verifyError || !user) {
      throw new Error("無効なトークンです");
    }

    // quizzesのcreated_byをNULLにする
    const { error: updateError } = await supabaseAdmin
      .from("quizzes")
      .update({ created_by: null })
      .eq("created_by", user.id);

    if (updateError) {
      throw updateError;
    }

    // user_quiz_resultsからユーザーデータを削除する
    const { error: deleteResultsError } = await supabaseAdmin
      .from("user_quiz_results")
      .delete()
      .eq("user_id", user.id);

    if (deleteResultsError) {
      throw deleteResultsError;
    }

    // quiz_likesからユーザーデータを削除する
    const { error: deleteLikesError } = await supabaseAdmin
      .from("quiz_likes")
      .delete()
      .eq("user_id", user.id);

    if (deleteLikesError) {
      throw deleteLikesError;
    }

    // usersテーブルからユーザーレコードを削除する
    const { error: deleteUserRecordError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteUserRecordError) {
      throw deleteUserRecordError;
    }

    // Delete the user using admin client
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ message: "アカウントが削除されました" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "アカウントの削除中にエラーが発生しました",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
