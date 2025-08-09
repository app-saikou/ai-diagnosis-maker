import React from "react";
import { Helmet } from "react-helmet-async";
import StructuredData from "../components/ui/StructuredData";

const PrivacyPolicyPage = () => (
  <>
    <Helmet>
      <title>プライバシーポリシー - AI相談メーカー | 個人情報保護方針</title>
      <meta
        name="description"
        content="AI相談メーカーのプライバシーポリシー。個人情報の取り扱い、利用目的、第三者提供について詳しく説明しています。"
      />
      <meta
        name="keywords"
        content="プライバシーポリシー, 個人情報保護, AI相談, データ保護"
      />
      <meta name="robots" content="index, follow" />
      <link
        rel="canonical"
        href="https://ai-consultation.netlify.app/privacy"
      />
    </Helmet>

    <StructuredData
      type="article"
      data={{
        title: "プライバシーポリシー - AI相談メーカー",
        description:
          "AI相談メーカーのプライバシーポリシー。個人情報の取り扱いについて詳しく説明しています。",
        url: "https://ai-consultation.netlify.app/privacy",
        datePublished: "2024-12-19",
      }}
    />

    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary-700">
        プライバシーポリシー
      </h1>
      <p className="mb-8 text-gray-700">
        「AIだけどなにか相談ある？」（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本ポリシーは、当サービスにおけるユーザー情報の取扱いについて定めるものです。
      </p>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
        <p className="text-blue-800 text-sm">
          <strong>更新日:</strong> 2024年12月19日
          <br />
          <strong>最終確認:</strong> 2024年12月19日
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        1. 取得する情報
      </h2>
      <ul className="list-disc pl-6 mb-8 text-gray-800 space-y-1">
        <li>メールアドレス（会員登録・お問い合わせ時）</li>
        <li>ニックネーム・表示名</li>
        <li>相談内容・相談履歴</li>
        <li>サービス利用状況（相談回数、チケット残数等）</li>
        <li>
          決済情報（Stripe等の外部決済サービスを利用。クレジットカード情報は当サービス側で保持しません）
        </li>
        <li>Cookie・アクセス解析情報（Google Analytics等）</li>
        <li>広告表示のための情報（Google AdSense等）</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        2. 利用目的
      </h2>
      <ul className="list-disc pl-6 mb-8 text-gray-800 space-y-1">
        <li>サービスの提供・運営・改善</li>
        <li>相談内容へのAIによる回答生成</li>
        <li>チケット管理・決済処理</li>
        <li>お問い合わせ対応</li>
        <li>不正利用防止・セキュリティ向上</li>
        <li>サービス利用状況の分析・マーケティング</li>
        <li>法令等に基づく対応</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        3. 第三者提供
      </h2>
      <ul className="list-disc pl-6 mb-8 text-gray-800 space-y-1">
        <li>
          ユーザーの同意がある場合、法令に基づく場合を除き、個人情報を第三者に提供しません。
        </li>
        <li>
          ただし、決済処理（Stripe等）や広告配信（Google
          AdSense等）に必要な範囲で外部サービスに情報が送信される場合があります。
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        4. 外部サービスの利用
      </h2>
      <p className="mb-8 text-gray-800">
        当サービスは、AIによる回答生成、決済、広告配信、アクセス解析等で外部サービス（OpenAI,
        Stripe,
        Google等）を利用しています。これら外部サービスのプライバシーポリシーもご確認ください。
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        5. 相談内容の取り扱い
      </h2>
      <p className="mb-8 text-gray-800">
        相談内容は匿名で管理され、他のユーザーに公開されることはありません。AIによる回答生成のため、相談内容が外部AIサービス（例：OpenAI
        API）に送信される場合があります。
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        6. Cookie等の利用
      </h2>
      <p className="mb-8 text-gray-800">
        サービス向上や広告配信、アクセス解析のため、Cookie等の技術を利用する場合があります。
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600">
        7. お問い合わせ
      </h2>
      <p className="mb-2 text-gray-800">
        ご質問・ご要望は下記メールアドレスまでご連絡ください。
      </p>
      <a
        href="mailto:webzero.net@gmail.com"
        className="text-primary-600 hover:underline"
      >
        webzero.net@gmail.com
      </a>

      <h2 className="text-2xl font-semibold mb-4 text-primary-600 mt-12">
        8. 改定
      </h2>
      <p className="text-gray-800">
        本ポリシーは必要に応じて改定する場合があります。改定時は本ページでお知らせします。
      </p>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          Google AdSenseに関する追加情報
        </h3>
        <p className="text-gray-700 text-sm mb-3">
          当サービスでは、Google AdSenseを使用して広告を配信しています。Google
          AdSenseは、ユーザーの興味に基づいてパーソナライズされた広告を表示するためにCookieを使用する場合があります。
        </p>
        <p className="text-gray-700 text-sm">
          詳細については、
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            Google AdSenseのプライバシーポリシー
          </a>
          をご確認ください。
        </p>
      </div>
    </div>
  </>
);

export default PrivacyPolicyPage;
