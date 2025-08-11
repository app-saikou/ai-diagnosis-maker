import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Crown, Ticket } from "lucide-react";

const PricingPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { t } = useLanguage();

  const PLANS = [
    {
      type: "subscription",
      name: t("premiumMember"),
      price: 500,
      unit: t("monthly"),
      description: [
        t("unlimitedConsultations"),
        t("noAds"),
        t("premiumTemplates"),
      ],
      button: t("premiumRegistration"),
    },
  ];

  const TICKETS = [
    {
      name: t("consultationTicket1"),
      price: 50,
      price_id: import.meta.env.VITE_STRIPE_TICKET_PRICE_ID_1,
      count: 1,
    },
    {
      name: t("consultationTicket3"),
      price: 120,
      price_id: import.meta.env.VITE_STRIPE_TICKET_PRICE_ID_3,
      count: 3,
    },
    {
      name: t("consultationTicket10"),
      price: 300,
      price_id: import.meta.env.VITE_STRIPE_TICKET_PRICE_ID_10,
      count: 10,
    },
  ];

  // 環境変数のデバッグ情報
  console.log("🔍 環境変数確認:", {
    VITE_STRIPE_TICKET_PRICE_ID_1: import.meta.env.VITE_STRIPE_TICKET_PRICE_ID_1,
    VITE_STRIPE_TICKET_PRICE_ID_3: import.meta.env.VITE_STRIPE_TICKET_PRICE_ID_3,
    VITE_STRIPE_TICKET_PRICE_ID_10: import.meta.env.VITE_STRIPE_TICKET_PRICE_ID_10,
  });

  // サブスク決済
  const handleSubscribe = async () => {
    try {
      const userId = authUser?.id;
      if (!userId) throw new Error(t("userIdError"));

      // シンプルに相対パスのみ使用
      const apiUrl = "/.netlify/functions/create-checkout";

      console.log("🔗 API URL:", apiUrl);
      console.log("🔗 リクエストデータ:", {
        userId,
        priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID,
        }),
      });

      console.log("🔗 レスポンスステータス:", response.status);

      if (!response.ok) {
        // エラーレスポンスの詳細を取得
        const errorData = await response.text();
        console.error("🔗 エラーレスポンス:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorData}`
        );
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("決済エラー詳細:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`決済エラー: ${errorMessage}`);
    }
  };

  // チケット決済
  const handleBuyTicket = async (price_id: string) => {
    try {
      const userId = authUser?.id;
      if (!userId) throw new Error(t("userIdError"));

      // price_idの検証
      if (!price_id) {
        throw new Error("価格IDが設定されていません。環境変数を確認してください。");
      }

      // シンプルに相対パスのみ使用
      const apiUrl = "/.netlify/functions/create-ticket-checkout";

      console.log("🔗 API URL:", apiUrl);
      console.log("🔗 リクエストデータ:", { userId, price_id });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, price_id }),
      });

      console.log("🔗 レスポンスステータス:", response.status);

      if (!response.ok) {
        // エラーレスポンスの詳細を取得
        const errorData = await response.text();
        console.error("🔗 エラーレスポンス:", errorData);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorData}`
        );
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("チケット決済エラー詳細:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`決済エラー: ${errorMessage}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary-700 tracking-tight">
        {t("pricingPlans")}
      </h1>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* サブスクプラン */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-2 border-yellow-200 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full p-3 shadow-md">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-yellow-700 mt-8 mb-2">
            {PLANS[0].name}
          </h2>
          <div className="text-4xl font-extrabold text-yellow-700 mb-2">
            ￥{PLANS[0].price}
            <span className="text-lg font-medium text-yellow-600">
              {" "}
              / {PLANS[0].unit}
            </span>
          </div>
          <ul className="text-gray-700 mb-6 space-y-2 text-left">
            {PLANS[0].description.map((desc, i) => (
              <li key={i}>・{desc}</li>
            ))}
          </ul>
          <button
            onClick={handleSubscribe}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors text-lg mt-auto"
          >
            {PLANS[0].button}
          </button>
        </div>
        {/* チケットプラン */}
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center border-2 border-primary-200 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-500 rounded-full p-3 shadow-md">
            <Ticket className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary-700 mt-8 mb-2">
            {t("consultationTickets")}
          </h2>
          <div className="w-full flex flex-col gap-4 mt-4">
            {TICKETS.map((ticket) => (
              <div
                key={ticket.price_id}
                className="flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3 shadow-sm border border-primary-100"
              >
                <div>
                  <div className="font-semibold text-primary-800 text-lg">
                    {ticket.name}
                  </div>
                  <div className="text-sm text-primary-600">
                    ￥{ticket.price}
                    {t("includingTax")}
                  </div>
                </div>
                <button
                  onClick={() => handleBuyTicket(ticket.price_id)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors text-base"
                >
                  {t("purchase")}
                </button>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-6 text-center">
            {t("ticketNote")}
            <br />
            {t("ticketNote2")}
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm">
        {t("allPricesIncludeTax")}
        <br />
        {t("premiumNote")}
      </div>
    </div>
  );
};

export default PricingPage;
