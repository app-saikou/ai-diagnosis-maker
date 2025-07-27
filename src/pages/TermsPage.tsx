import React from "react";
import { Link } from "react-router-dom";

const TermsPage = () => (
  <div className="max-w-3xl mx-auto py-16 px-4">
    <h1 className="text-3xl font-bold mb-6 text-primary-700">利用規約</h1>
    <p className="mb-8 text-gray-700">
      「AIだけどなにか相談ある？」（以下「当サービス」）は、以下の利用規約（以下「本規約」）に基づきサービスを提供します。ご利用前に必ずお読みください。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第1条（適用）
    </h2>
    <p className="mb-6 text-gray-800">
      本規約は、当サービスの利用に関する一切の関係に適用されます。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第2条（利用登録）
    </h2>
    <ul className="list-disc pl-6 mb-6 text-gray-800 space-y-1">
      <li>
        ユーザーは、本規約に同意の上、所定の方法で利用登録を行うものとします。
      </li>
      <li>当サービスは、利用登録の申請者に対し、登録の可否を判断します。</li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第3条（アカウント管理）
    </h2>
    <ul className="list-disc pl-6 mb-6 text-gray-800 space-y-1">
      <li>
        ユーザーは、自己の責任においてアカウント情報を管理するものとします。
      </li>
      <li>
        アカウントの不正利用等による損害について、当サービスは一切の責任を負いません。
      </li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第4条（禁止事項）
    </h2>
    <ul className="list-disc pl-6 mb-6 text-gray-800 space-y-1">
      <li>法令または公序良俗に違反する行為</li>
      <li>他のユーザーまたは第三者の権利を侵害する行為</li>
      <li>不正アクセス、システムへの攻撃</li>
      <li>サービスの運営を妨害する行為</li>
      <li>虚偽の情報登録</li>
      <li>その他、当サービスが不適切と判断する行為</li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第5条（サービス内容）
    </h2>
    <ul className="list-disc pl-6 mb-6 text-gray-800 space-y-1">
      <li>当サービスは、AIによる相談回答サービスを提供します。</li>
      <li>サービス内容は予告なく変更・停止する場合があります。</li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第6条（有料サービス・決済）
    </h2>
    <ul className="list-disc pl-6 mb-6 text-gray-800 space-y-1">
      <li>
        有料サービス（チケット・サブスクリプション等）の利用には、所定の料金が発生します。
      </li>
      <li>
        料金・支払い方法は
        <Link to="/pricing" className="text-primary-600 hover:underline">
          料金表
        </Link>
        ページに記載します。
      </li>
      <li>決済完了後の返金は原則できません。</li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第7条（知的財産権）
    </h2>
    <p className="mb-6 text-gray-800">
      当サービスに関する著作権・商標権等の知的財産権は、当サービスまたは正当な権利者に帰属します。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第8条（免責事項）
    </h2>
    <ul className="list-disc pl-6 mb-6 text-gray-800 space-y-1">
      <li>
        当サービスは、AIによる回答の正確性・有用性・完全性を保証しません。
      </li>
      <li>
        サービス利用により生じた損害について、当サービスは一切の責任を負いません。
      </li>
    </ul>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第9条（利用停止・登録抹消）
    </h2>
    <p className="mb-6 text-gray-800">
      ユーザーが本規約に違反した場合、当サービスは事前通知なく利用停止・アカウント削除等の措置を取ることができます。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第10条（規約の変更）
    </h2>
    <p className="mb-6 text-gray-800">
      当サービスは、必要に応じて本規約を変更できます。変更後の規約は本ページに掲載した時点で効力を生じます。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      第11条（準拠法・管轄）
    </h2>
    <p className="mb-6 text-gray-800">
      本規約は日本法に準拠し、当サービスに関する紛争は名古屋地方裁判所を第一審の専属的合意管轄裁判所とします。
    </p>
    <h2 className="text-2xl font-semibold mb-4 text-primary-600">
      お問い合わせ
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
  </div>
);

export default TermsPage;
