import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // 3秒後にホームページにリダイレクト
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            決済が完了しました！
          </h1>
          <p className="text-gray-600 mb-6">
            プレミアム会員として登録されました。
            <br />
            すべての機能をご利用いただけます。
          </p>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-sm text-green-800">アカウント: {user?.email}</p>
          </div>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
          <p className="text-xs text-gray-500 mt-4">
            3秒後に自動的にホームページに移動します
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
