import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { useUser } from '../contexts/UserContext';
import { adService } from '../services/adService';
import TakeQuizPage from './TakeQuizPage';

const DiagnosisPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { getQuizById, setCurrentQuiz } = useQuiz();
  const { isPremium, incrementQuizCount } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizToStart, setQuizToStart] = useState<Quiz | null>(null);
  
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        setError('相談テンプレートが見つかりません');
        return;
      }
      
      try {
        const template = await getQuizById(templateId);
        if (!template || !template.isTemplate) {
          setError('無効な相談テンプレートです');
          return;
        }
        
        // 新しいクイズインスタンスを作成
        const newQuiz = {
          ...template,
          id: crypto.randomUUID(),
          isTemplate: false,
          templateId: template.id,
          createdAt: new Date().toISOString(),
          completions: 0,
          likes: 0
        };
        
        // sessionStorageを使用してカウント制御
        const sessionKey = `quiz_started_${newQuiz.id}`;
        const hasStarted = sessionStorage.getItem(sessionKey);
        
        if (!hasStarted) {
          // セッション内で初回の診断開始時のみカウント
          sessionStorage.setItem(sessionKey, 'true');
          incrementQuizCount();
        }
        
        // 無料ユーザーの場合は広告を表示
        if (!isPremium) {
          await adService.showInterstitialAd();
        }

        setCurrentQuiz(newQuiz);
        setQuizToStart(newQuiz);
      } catch (err) {
        console.error('Error loading template:', err);
        setError('相談テンプレートの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId, getQuizById, setCurrentQuiz, isPremium, incrementQuizCount]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">エラー</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  if (quizToStart) {
    return <TakeQuizPage />;
  }
  
  return null;
};

export default DiagnosisPage;