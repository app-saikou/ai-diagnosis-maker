import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import CreateQuizPage from "./pages/CreateQuizPage";
import TakeQuizPage from "./pages/TakeQuizPage";
import ResultsPage from "./pages/ResultsPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import DiagnosisPage from "./pages/DiagnosisPage";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import PricingPage from "./pages/PricingPage";
import ScrollToTop from "./components/ScrollToTop";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import LegalNoticePage from "./pages/LegalNoticePage";
import TermsPage from "./pages/TermsPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreateQuizPage />} />
          <Route path="quiz/:quizId" element={<TakeQuizPage />} />
          <Route path="results/:quizId" element={<ResultsPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="d/:templateId" element={<DiagnosisPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="legal" element={<LegalNoticePage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="cookie" element={<CookiePolicyPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="cancel" element={<CancelPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
