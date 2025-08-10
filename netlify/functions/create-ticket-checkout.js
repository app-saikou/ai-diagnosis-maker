const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // CORS設定
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // OPTIONSリクエスト（CORS preflight）
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // POSTリクエストのみ処理
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // デバッグ情報を追加
    console.log("🔍 リクエストボディ:", event.body);
    console.log(
      "🔍 STRIPE_SECRET_KEY exists:",
      !!process.env.STRIPE_SECRET_KEY
    );

    const { userId, price_id } = JSON.parse(event.body);

    console.log("🔍 userId:", userId);
    console.log("🔍 price_id:", price_id);

    // 環境変数に依存せず、確実に本番URLを指定
    const baseUrl = "https://ai-consultation.netlify.app";

    console.log("🔍 Stripeセッション作成開始...");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      client_reference_id: userId,
    });

    console.log("🔍 Stripeセッション作成成功:", session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("❌ エラー詳細:", err);
    console.error("❌ エラーメッセージ:", err.message);
    console.error("❌ エラースタック:", err.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: err.message,
        details: err.stack,
        type: err.constructor.name,
      }),
    };
  }
};
