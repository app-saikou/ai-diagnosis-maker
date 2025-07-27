require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Webhookエンドポイントの前に生データを処理するミドルウェアを配置
app.post("/webhook", express.raw({ type: "application/json" }));

// その他のエンドポイント用のJSONパーサー
app.use(express.json());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Checkoutセッション作成API
app.post("/api/create-checkout-session", async (req, res) => {
  const { userId } = req.body;

  // 環境に応じてURLを設定
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://your-app.com"
      : "http://localhost:5173";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      client_reference_id: userId,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// サブスク解約API
app.post("/api/cancel-subscription", async (req, res) => {
  const { userId } = req.body;

  try {
    // ユーザーのStripe customer IDを取得
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (userError || !userData?.stripe_customer_id) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // ユーザーのアクティブなサブスクリプションを取得
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // サブスクリプションを解約（期間終了時にキャンセル）
    const subscription = await stripe.subscriptions.update(
      subscriptions.data[0].id,
      { cancel_at_period_end: true }
    );

    // Supabaseのis_premiumをfalseに更新
    const { error: updateError } = await supabase
      .from("users")
      .update({ is_premium: false })
      .eq("id", userId);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update user status" });
    }

    res.json({
      success: true,
      message:
        "Subscription will be cancelled at the end of the current period",
      cancel_at: subscription.cancel_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook受信API
app.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const customerId = session.customer;
    // 追加: 受信ログ
    console.log("[Webhook] checkout.session.completed 受信", {
      userId,
      mode: session.mode,
      sessionId: session.id,
    });
    if (!userId) return res.status(400).send("No client_reference_id");

    // サブスク決済（mode: subscription）
    if (session.mode === "subscription") {
      const { error } = await supabase
        .from("users")
        .update({ is_premium: true, stripe_customer_id: customerId })
        .eq("id", userId);
      if (error) {
        return res.status(500).send("Supabase update error");
      }
      return res.json({ received: true });
    }

    // チケット決済（mode: payment）
    if (session.mode === "payment") {
      // チケット商品IDと枚数のマッピング
      const priceToCount = {
        price_1Rl9H6BDZKTuon087WLZVdSZ: 1, // 1枚
        price_1Rl9GJBDZKTuon08ozCutQYR: 3, // 3枚
        price_1Rkv9KBDZKTuon084VUeTgzf: 10, // 10枚
      };
      // line_items APIで取得
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      const priceId = lineItems.data[0]?.price?.id;
      const addCount = priceToCount[priceId] || 0;
      // 追加: チケット決済時の詳細ログ
      console.log("[Webhook] チケット決済", { userId, priceId, addCount });
      if (addCount > 0) {
        // 現在のticket_countを取得
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("ticket_count")
          .eq("id", userId)
          .single();
        if (userError) {
          return res.status(500).send("Supabase get user error");
        }
        const currentCount = userData?.ticket_count || 0;
        const { error: updateError } = await supabase
          .from("users")
          .update({ ticket_count: currentCount + addCount })
          .eq("id", userId);
        if (updateError) {
          return res.status(500).send("Supabase update ticket_count error");
        }
      }
      return res.json({ received: true });
    }

    // その他
    return res.json({ received: true });
  } else {
    res.json({ received: true });
  }
});

// 相談チケット購入用Checkoutセッション作成API
app.post("/api/create-ticket-checkout-session", async (req, res) => {
  const { userId, price_id } = req.body;
  // 環境に応じてURLを設定
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://your-app.com"
      : "http://localhost:5173";
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      client_reference_id: userId,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Stripe server running on port ${PORT}`));
