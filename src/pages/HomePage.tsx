import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Wand,
  Infinity,
  Star,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { useQuiz } from "../contexts/QuizContext";
import { useLanguage } from "../contexts/LanguageContext";
import QuizCard from "../components/ui/QuizCard";
import { Quiz } from "../types";

const HomePage = () => {
  const { quizzes, refreshQuizzes } = useQuiz();
  const { t, language } = useLanguage();
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (quizzes.length > 0) {
      const popular = [...quizzes]
        .sort((a, b) => b.completions + b.likes - (a.completions + a.likes))
        .slice(0, 3);

      setFeaturedQuizzes(popular);
    }
  }, [quizzes]);

  // 定期的なクイズリスト更新（30秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuizzes();
    }, 30000); // 30秒ごとに更新

    return () => clearInterval(interval);
  }, [refreshQuizzes]);

  const features = [
    {
      icon: <Wand className="h-6 w-6 text-primary-600" />,
      title: language === "ja" ? "AIによる自動生成" : "AI Generation",
      description:
        language === "ja"
          ? "相談内容を入力するだけで、AIが診断形式で回答を自動生成します。"
          : "Just enter a title and let AI generate engaging personality quizzes for you.",
      color: "primary",
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      title: language === "ja" ? "カスタマイズ可能" : "Customizable",
      description:
        language === "ja"
          ? "質問、選択肢、結果を自由にカスタマイズして、あなただけの相談を作成できます。"
          : "Customize questions, options, and results to create your unique personality quiz.",
      color: "yellow",
    },
    {
      icon: <Zap className="h-6 w-6 text-blue-600" />,
      title: language === "ja" ? "即時共有可能" : "Instant Sharing",
      description:
        language === "ja"
          ? "相談結果をすぐにSNSで共有できます。友達や家族と楽しみましょう。"
          : "Share your quizzes instantly on social media. Have fun with friends and family.",
      color: "blue",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-6xl font-bold text-gray-900 transition-all duration-300">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                    {t("appDescription")}
                  </span>
                </h1>

                <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
                  {t("createQuizDescription")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/create"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-primary-600 px-8 py-4 text-white transition duration-300 ease-out hover:scale-105"
                >
                  <span className="absolute inset-0 h-full w-full scale-0 rounded-lg bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 opacity-0 transition duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    <Wand className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    {t("create")}
                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>

                <Link
                  to="/explore"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-white border-2 border-gray-200 px-8 py-4 text-gray-900 transition duration-300 ease-out hover:scale-105"
                >
                  <span className="absolute inset-0 h-full w-full scale-0 rounded-lg bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 opacity-0 transition duration-300 ease-out group-hover:scale-100 group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-2">
                    <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    {t("explore")}
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              {/* Floating Elements */}
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 animate-float">
                <BrainCircuit className="h-12 w-12 text-primary-500" />
              </div>
              <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 animate-float-delay-2">
                <div className="space-y-3">
                  <div className="h-2 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                  <div className="h-2 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="absolute bottom-1/4 left-1/3 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-xl shadow-lg p-6 animate-float-delay-4">
                <div className="space-y-2">
                  <div className="h-4 bg-primary-100 rounded w-20"></div>
                  <div className="h-2 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Main Visual */}
              <div className="relative bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <BrainCircuit className="h-6 w-6 text-primary-600" />-
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        AIだけど相談ある？
                      </h3>
                      <p className="text-sm text-gray-600">
                        あなたの相談を作成
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-primary-50 rounded-lg">
                      <div className="h-4 bg-primary-200 rounded w-16 mb-2"></div>
                      <div className="h-2 bg-primary-100 rounded w-full"></div>
                    </div>
                    <div className="p-3 bg-secondary-50 rounded-lg">
                      <div className="h-4 bg-secondary-200 rounded w-16 mb-2"></div>
                      <div className="h-2 bg-secondary-100 rounded w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 h-8 w-8 bg-accent-100 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 h-8 w-8 bg-primary-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {language === "ja" ? "主な機能" : "Key Features"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === "ja"
              ? "AIの力を活用して、魅力的な相談を簡単に作成できます"
              : "Leverage the power of AI to create engaging personality quizzes with ease"}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
                  relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                  ${
                    index === activeFeature
                      ? "scale-105 shadow-xl"
                      : "scale-100 shadow-md"
                  }
                  bg-white hover:shadow-lg hover:-translate-y-1
                `}
              >
                <div
                  className={`
                  absolute top-0 left-0 w-1 h-full
                  bg-${feature.color}-500
                `}
                ></div>
                <div
                  className={`
                  w-12 h-12 rounded-full mb-4 flex items-center justify-center
                  bg-${feature.color}-100
                `}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                1000+
              </div>
              <div className="text-gray-600">
                {language === "ja" ? "作成された相談" : "Quizzes Created"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-600 mb-2">
                50K+
              </div>
              <div className="text-gray-600">
                {language === "ja" ? "月間ユーザー" : "Monthly Users"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-600 mb-2">4.8</div>
              <div className="text-gray-600">
                {language === "ja" ? "平均評価" : "Average Rating"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">98%</div>
              <div className="text-gray-600">
                {language === "ja" ? "ユーザー満足度" : "User Satisfaction"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Quizzes */}
      {featuredQuizzes.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {language === "ja" ? "人気の相談" : "Popular Quizzes"}
                </h2>
                <p className="text-gray-600">
                  {language === "ja"
                    ? "みんなが楽しんでいる相談をチェックしましょう"
                    : "Check out what others are enjoying"}
                </p>
              </div>
              <Link
                to="/explore"
                className="text-primary-600 hover:text-primary-700 flex items-center group"
              >
                {language === "ja" ? "すべて見る" : "See All"}
                <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Premium Banner */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 flex flex-col md:flex-row items-center">
              <div className="flex-1 text-white mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">
                  {language === "ja"
                    ? "プレミアムで可能性が広がる"
                    : "Unlock More with Premium"}
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Infinity className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "ja"
                        ? "無制限の相談作成で、より多くのアイデアを形に"
                        : "Create unlimited quizzes and bring more ideas to life"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "ja"
                        ? "広告なしでクリーンな体験を"
                        : "Ad-free experience for clean interface"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>
                      {language === "ja"
                        ? "詳細な分析と履歴管理"
                        : "Detailed analytics and history tracking"}
                    </span>
                  </li>
                </ul>
                <button className="mt-8 bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                  {language === "ja"
                    ? "プレミアムを始める"
                    : "Get Started with Premium"}
                </button>
              </div>

              <div className="flex-1 flex justify-center">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 max-w-sm w-full">
                  <div className="text-white text-lg font-medium mb-6">
                    {language === "ja" ? "プレミアム特典" : "Premium Benefits"}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-white">
                        {language === "ja"
                          ? "無制限の相談作成"
                          : "Unlimited Quizzes"}
                      </span>
                    </div>
                    <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-white">
                        {language === "ja" ? "広告なし" : "No Ads"}
                      </span>
                    </div>
                    <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-white">
                        {language === "ja"
                          ? "プレミアムテンプレート"
                          : "Premium Templates"}
                      </span>
                    </div>
                    <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-white">
                        {language === "ja"
                          ? "詳細な分析"
                          : "Detailed Analytics"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
