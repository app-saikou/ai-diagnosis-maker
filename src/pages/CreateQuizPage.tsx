import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Shuffle, AlertCircle, Shield } from 'lucide-react';
import { useQuiz } from '../contexts/QuizContext';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { aiService } from '../services/aiService';
import { containsNgWord } from '../utils/ngWords';
import QuizModeSelector from '../components/ui/QuizModeSelector';
import AuthPrompt from '../components/ui/AuthPrompt';
import AuthModal from '../components/auth/AuthModal';
import QuizConfirmModal from '../components/ui/QuizConfirmModal';
import { QuizMode } from '../types';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { generateQuiz, isGenerating, error } = useQuiz();
  const { canTakeQuiz, incrementQuizCount, quizzesRemaining, isPremium, dailyLimit } = useUser();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const [title, setTitle] = useState(aiService.getRandomTitle(language));
  const [selectedMode, setSelectedMode] = useState<QuizMode>('standard');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState<{ title: string; mode: QuizMode } | null>(null);
  const [ngWordError, setNgWordError] = useState<string | null>(null);
  
  useEffect(() => {
    setTitle(aiService.getRandomTitle(language));
  }, [language]);
  
  const handleShuffle = () => {
    setTitle(aiService.getRandomTitle(language));
    // シャッフル時にエラーをクリア
    setNgWordError(null);
    if (localError && localError.includes('タイトル')) {
      setLocalError(null);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    // 50文字制限
    if (newTitle.length <= 50) {
      setTitle(newTitle);
      
      // NGワードチェック
      const ngWordCheck = containsNgWord(newTitle);
      if (ngWordCheck.hasNgWord) {
        setNgWordError('不適切な単語が検出されました');
      } else {
        setNgWordError(null);
      }
      
      // エラーメッセージをクリア
      if (localError && localError.includes('タイトル')) {
        setLocalError(null);
      }
    }
  };
  
  const handleCreateQuiz = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!canTakeQuiz) {
      setLocalError(language === 'ja' ? 'プレミアムにアップグレードして制限を緩和しましょう' : 'Upgrade to premium to increase your daily limit');
      return;
    }

    // タイトルの入力チェック
    if (!title.trim()) {
      setLocalError(language === 'ja' ? 'クイズタイトルを入力してください' : 'Please enter a quiz title');
      return;
    }

    // NGワードチェック
    const ngWordCheck = containsNgWord(title.trim());
    if (ngWordCheck.hasNgWord) {
      setNgWordError('不適切な単語が検出されました');
      setLocalError(language === 'ja' ? '不適切な内容が含まれています' : 'Inappropriate content detected');
      return;
    }

    setLocalError(null);
    setNgWordError(null);
    setPendingQuiz({ title: title.trim(), mode: selectedMode });
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingQuiz) return;
    
    setShowConfirmModal(false);
    
    try {
      const newQuiz = await generateQuiz(pendingQuiz.title, pendingQuiz.mode);
      incrementQuizCount();
      navigate(`/quiz/${newQuiz.id}`);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setLocalError(err instanceof Error ? err.message : language === 'ja' ? 'クイズの生成中にエラーが発生しました' : 'Error generating quiz');
    } finally {
      setPendingQuiz(null);
    }
  };

  // タイトルが空かどうかをチェック
  const isTitleEmpty = !title.trim();
  // 文字数カウント
  const titleLength = title.length;
  // NGワードが含まれているかチェック
  const hasNgWord = containsNgWord(title).hasNgWord;

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthPrompt
          title="クイズを作成するにはログインが必要です"
          message="アカウントを作成して、自分だけの相談をしましょう"
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          {language === 'ja' ? 'クイズを作成' : 'Create Quiz'}
        </h1>
        <p className="text-gray-600">
          {language === 'ja' ? 'タイトルを入力してAIがクイズを生成します' : 'Enter a title and let AI generate your quiz'}
        </p>
      </div>
      
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-primary-800 font-medium">
              {isPremium ? '1日の相談チケット制限: 30枚' : '無料ユーザーの制限'}
            </p>
            <p className="text-primary-700 text-sm">
              {language === 'ja' 
                ? `残り相談チケット: ${quizzesRemaining}枚 / ${dailyLimit}枚`
                : `${quizzesRemaining} consultation tickets remaining out of ${dailyLimit}`}
              <br />
              {!isPremium && (language === 'ja'
                ? 'プレミアムにアップグレードして制限を緩和しましょう'
                : 'Upgrade to premium to increase your daily limit')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">
              {language === 'ja' ? 'クイズタイトル' : 'Quiz Title'}
            </h2>
            <span className={`text-sm ${titleLength > 45 ? 'text-red-600' : titleLength > 40 ? 'text-yellow-600' : 'text-gray-500'}`}>
              {titleLength}/50
            </span>
          </div>
          <div className="relative">
            <input
              type="text"
              id="quiz-title"
              value={title}
              onChange={handleTitleChange}
              className={`input pr-10 ${
                isTitleEmpty || hasNgWord 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : ''
              }`}
              placeholder={language === 'ja' ? 'クイズのタイトルを入力（必須）' : 'Enter quiz title (required)'}
              maxLength={50}
            />
            <button
              onClick={handleShuffle}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary-600"
              title={language === 'ja' ? 'シャッフル' : 'Shuffle'}
            >
              <Shuffle className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-1 flex justify-between items-start">
            <p className="text-sm text-gray-500">
              {language === 'ja' 
                ? 'タイトルを入力するか、シャッフルボタンをクリックしてランダムなタイトルを生成できます'
                : 'Enter a title or click shuffle to generate a random one'}
            </p>
          </div>
          {isTitleEmpty && (
            <p className="mt-1 text-sm text-red-600">
              {language === 'ja' ? 'タイトルは必須です' : 'Title is required'}
            </p>
          )}
          {ngWordError && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              {ngWordError}
            </p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {language === 'ja' ? 'クイズモード' : 'Quiz Mode'}
          </h2>
          <QuizModeSelector 
            selectedMode={selectedMode} 
            onSelectMode={setSelectedMode} 
          />
        </div>
        
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error || localError}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            onClick={handleCreateQuiz}
            disabled={isGenerating || !canTakeQuiz || isTitleEmpty || hasNgWord}
            className={`btn-primary flex-1 flex items-center justify-center ${
              (isTitleEmpty || hasNgWord) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === 'ja' ? '生成中...' : 'Generating...'}
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                {language === 'ja' ? 'クイズを生成' : 'Generate Quiz'}
              </>
            )}
          </button>
        </div>
      </div>

      <QuizConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingQuiz(null);
        }}
        onConfirm={handleConfirmCreate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default CreateQuizPage;