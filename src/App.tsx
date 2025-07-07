import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import CreateQuizPage from './pages/CreateQuizPage';
import TakeQuizPage from './pages/TakeQuizPage';
import ResultsPage from './pages/ResultsPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import DiagnosisPage from './pages/DiagnosisPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="create" element={<CreateQuizPage />} />
        <Route path="quiz/:quizId" element={<TakeQuizPage />} />
        <Route path="results/:quizId" element={<ResultsPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="d/:templateId" element={<DiagnosisPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;