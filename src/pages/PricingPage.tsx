import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Crown, Ticket } from "lucide-react";

const PricingPage: React.FC = () => {
  const { user } = useAuth();
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
      price_id: "price_1Rl9H6BDZKTuon087WLZVdSZ",
      count: 1,
    },
    {
      name: t("consultationTicket3"),
      price: 120,
      price_id: "price_1Rl9GJBDZKTuon08ozCutQYR",
      count: 3,
    },
    {
      name: t("consultationTicket10"),
      price: 300,
      price_id: "price_1Rkv9KBDZKTuon084VUeTgzf",
      count: 10,
    },
  ];

  // サブスク決済
  const handleSubscribe = async () => {
    try {
      const userId = user?.id;
      if (!userId) throw new Error(t("userIdError"));
      const res = await fetch(
        "http://localhost:4242/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      alert(t("paymentError"));
      console.error(err);
    }
  };

  // チケット決済
  const handleBuyTicket = async (price_id: string) => {
    try {
      const userId = user?.id;
      if (!userId) throw new Error(t("userIdError"));
      const res = await fetch(
        "http://localhost:4242/api/create-ticket-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, price_id }),
        }
      );
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      alert(t("paymentError"));
      console.error(err);
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
