const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  // Webhook署名の検証
  const sig = event.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // checkout.session.completedイベントの処理
  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object;
    const userId = session.client_reference_id;
    const customerId = session.customer;

    console.log("[Webhook] checkout.session.completed 受信", {
      userId,
      mode: session.mode,
      sessionId: session.id,
    });

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No client_reference_id" }),
      };
    }

    // サブスク決済（mode: subscription）
    if (session.mode === "subscription") {
      const { error } = await supabase
        .from("users")
        .update({ is_premium: true, stripe_customer_id: customerId })
        .eq("id", userId);

      if (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Supabase update error" }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true }),
      };
    }

    // チケット決済（mode: payment）
    if (session.mode === "payment") {
      const priceToCount = {
        price_1Rl9H6BDZKTuon087WLZVdSZ: 1, // 1枚
        price_1Rl9GJBDZKTuon08ozCutQYR: 3, // 3枚
        price_1Rkv9KBDZKTuon084VUeTgzf: 10, // 10枚
      };

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      const priceId = lineItems.data[0]?.price?.id;
      const addCount = priceToCount[priceId] || 0;

      console.log("[Webhook] チケット決済", { userId, priceId, addCount });

      if (addCount > 0) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("ticket_count")
          .eq("id", userId)
          .single();

        if (userError) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Supabase get user error" }),
          };
        }

        const currentCount = userData?.ticket_count || 0;
        const { error: updateError } = await supabase
          .from("users")
          .update({ ticket_count: currentCount + addCount })
          .eq("id", userId);

        if (updateError) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              error: "Supabase update ticket_count error",
            }),
          };
        }
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ received: true }),
      };
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ received: true }),
  };
};
