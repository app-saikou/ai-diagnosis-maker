import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  ArrowRight,
  Sparkles,
  Wand,
  Infinity,
  Shield,
} from "lucide-react";
import { useQuiz } from "../contexts/QuizContext";
import { useLanguage } from "../contexts/LanguageContext";
import QuizCard from "../components/ui/QuizCard";
import { Quiz } from "../types";

const HomePage = () => {
  const { quizzes, refreshQuizzes } = useQuiz();
  const { t } = useLanguage();
  const [featuredQuizzes, setFeaturedQuizzes] = useState<Quiz[]>([]);

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
      icon: <span className="text-3xl">🤖</span>,
      title: t("aiPoweredAnswers"),
      description: t("aiPoweredAnswersDescription"),
      color: "primary",
    },
    {
      icon: <span className="text-3xl">🎟️</span>,
      title: t("freeConsultations"),
      description: t("freeConsultationsDescription"),
      color: "yellow",
    },
    {
      icon: <span className="text-3xl">📤</span>,
      title: t("shareResults"),
      description: t("shareResultsDescription"),
      color: "blue",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      // setActiveFeature((prev) => (prev + 1) % features.length);
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
                  {t("consultationDescription")}
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
                        {t("appName")}
                      </h3>
                      <p className="text-sm text-gray-600">{t("create")}</p>
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
          <h2 className="text-3xl font-bold mb-4">{t("keyFeatures")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("keyFeaturesDescription")}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`
                  group relative flex flex-col items-center text-center
                  rounded-2xl p-8 shadow-md bg-white
                  transition-all duration-300
                  hover:shadow-xl hover:-translate-y-2
                  border-t-4 ${
                    feature.color === "primary"
                      ? "border-primary-500"
                      : feature.color === "yellow"
                      ? "border-yellow-400"
                      : "border-blue-400"
                  }
                `}
              >
                <div className="mb-4">
                  <span className="text-5xl block group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
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
            {/* リッチな特徴カード */}
            <div className="flex flex-col items-center text-center rounded-2xl p-8 shadow-md bg-primary-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-b-4 border-primary-500">
              <div className="mb-4 text-4xl bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center">
                🚀
              </div>
              <div className="text-xl font-bold mb-2 text-primary-700">
                {t("startConsultation")}
              </div>
              <div className="text-gray-700">{t("yourConsultation")}</div>
            </div>
            <div className="flex flex-col items-center text-center rounded-2xl p-8 shadow-md bg-yellow-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-b-4 border-yellow-400">
              <div className="mb-4 text-4xl bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center">
                💡
              </div>
              <div className="text-xl font-bold mb-2 text-yellow-700">
                {t("easyExperience")}
              </div>
              <div className="text-gray-700">{t("aiSupport")}</div>
            </div>
            <div className="flex flex-col items-center text-center rounded-2xl p-8 shadow-md bg-accent-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-b-4 border-accent-500">
              <div className="mb-4 text-4xl bg-accent-100 rounded-full w-16 h-16 flex items-center justify-center">
                🛡️
              </div>
              <div className="text-xl font-bold mb-2 text-accent-700">
                {t("privacy")}
              </div>
              <div className="text-gray-700">{t("privacyDescription")}</div>
            </div>
            <div className="flex flex-col items-center text-center rounded-2xl p-8 shadow-md bg-yellow-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-b-4 border-yellow-400">
              <div className="mb-4 text-4xl bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center">
                📝
              </div>
              <div className="text-xl font-bold mb-2 text-yellow-700">
                {t("reflectYourVoice")}
              </div>
              <div className="text-gray-700">{t("feedback")}</div>
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
                <h2 className="text-2xl font-bold mb-2">{t("popular")}</h2>
                <p className="text-gray-600">{t("explore")}</p>
              </div>
              <Link
                to="/explore"
                className="text-primary-600 hover:text-primary-700 flex items-center group"
              >
                {t("explore")}
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
                  {t("unlockWithPremium")}
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Infinity className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{t("unlimitedConsultations")}</span>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{t("adFreeExperience")}</span>
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="mt-8 bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors block text-center"
                >
                  {t("startPremium")}
                </Link>
              </div>

              <div className="flex-1 flex justify-center">
                <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 max-w-sm w-full">
                  <div className="text-white text-lg font-medium mb-6">
                    {t("premiumMember")}
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-white">
                        {t("unlimitedConsultations")}
                      </span>
                    </div>
                    <div className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center">
                      <div className="h-4 w-4 bg-green-400 rounded-full mr-3"></div>
                      <span className="text-white">{t("noAds")}</span>
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
