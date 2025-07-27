import React from "react";

const CookiePolicyPage = () => (
  <div className="max-w-3xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6 text-primary-700">
      クッキーポリシー
    </h1>
    <p className="mb-8 text-gray-700">
      「AIだけどなにか相談ある？」（以下「当サービス」）は、ユーザー体験の向上やサービスの改善のためにCookieおよび類似の技術を利用しています。本ポリシーでは、Cookieの利用目的や管理方法について説明します。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      1. Cookieとは
    </h2>
    <p className="mb-8 text-gray-800">
      Cookieとは、ウェブサイトを利用した際にユーザーの端末（PCやスマートフォン等）に保存される小さなテキストファイルです。Cookieにより、ユーザーの端末を識別したり、利便性を向上させたりすることができます。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      2. Cookieの利用目的
    </h2>
    <ul className="list-disc pl-6 mb-8 text-gray-800 space-y-1">
      <li>サービスの利便性向上（ログイン状態の保持等）</li>
      <li>サービス利用状況の分析（Google Analytics等によるアクセス解析）</li>
      <li>広告配信（Google AdSense等によるパーソナライズ広告表示）</li>
      <li>不正利用防止・セキュリティ向上</li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      3. 第三者によるCookie
    </h2>
    <p className="mb-8 text-gray-800">
      当サービスでは、以下の外部サービスがCookieを利用する場合があります。
    </p>
    <ul className="list-disc pl-6 mb-8 text-gray-800 space-y-1">
      <li>Google Analytics（アクセス解析）</li>
      <li>Google AdSense（広告配信）</li>
      <li>Stripe（決済処理）</li>
    </ul>
    <p className="mb-8 text-gray-800">
      これら外部サービスのCookie利用については、各サービスのプライバシーポリシーもご参照ください。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      4. Cookieの管理方法
    </h2>
    <p className="mb-8 text-gray-800">
      ユーザーは、ブラウザの設定によりCookieの受け入れ可否を選択したり、保存されたCookieを削除したりすることができます。ただし、Cookieを無効にした場合、当サービスの一部機能がご利用いただけなくなる場合があります。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      5. クッキーポリシーの変更
    </h2>
    <p className="mb-8 text-gray-800">
      本ポリシーは、必要に応じて改定する場合があります。改定時は本ページでお知らせします。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      6. お問い合わせ
    </h2>
    <p className="mb-2 text-gray-800">
      Cookieの利用に関するご質問は、下記メールアドレスまでご連絡ください。
    </p>
    <a
      href="mailto:webzero.net@gmail.com"
      className="text-primary-600 hover:underline"
    >
      webzero.net@gmail.com
    </a>
  </div>
);

export default CookiePolicyPage;
