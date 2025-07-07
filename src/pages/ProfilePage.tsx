import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Heart, Crown, X, User, Star, Sparkles, ChevronRight, History, Settings, Gift, Save, Edit2, Trash2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useQuiz } from '../contexts/QuizContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AuthPrompt from '../components/ui/AuthPrompt';
import AuthModal from '../components/auth/AuthModal';
import ProfileAvatar from '../components/ui/ProfileAvatar';
import LoginStreakDisplay from '../components/ui/LoginStreakDisplay';
import { supabase } from '../lib/supabase';

type FetchedQuizzes = {
  [key: string]: {
    title: string;
    results: Array<{
      id: string;
      title: string;
      imageUrl?: string;
    }>;
    createdBy: string;
  };
};

interface UserStats {
  createdQuizzes: number;
  totalLikes: number;
  totalCompletions: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isPremium, setIsPremium, quizzesRemaining, dailyLimit, updateDisplayName } = useUser();
  const { getQuizById } = useQuiz();
  const { t } = useLanguage();
  const { isAuthenticated, user: authUser, signOut } = useAuth();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user.displayName);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting2, setIsDeleting2] = useState(false);
  const [fetchedQuizzes, setFetchedQuizzes] = useState<FetchedQuizzes>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats>({
    createdQuizzes: 0,
    totalLikes: 0,
    totalCompletions: 0
  });
  const [showSettings, setShowSettings] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      try {
        // ユーザーが作成したクイズの統計を取得
        const { data: quizStats, error: statsError } = await supabase
          .from('quizzes')
          .select('id, likes, completions')
          .eq('created_by', authUser.id);

        if (statsError) throw statsError;

        const stats = {
          createdQuizzes: quizStats?.length || 0,
          totalLikes: quizStats?.reduce((sum, quiz) => sum + (quiz.likes || 0), 0) || 0,
          totalCompletions: quizStats?.reduce((sum, quiz) => sum + (quiz.completions || 0), 0) || 0
        };

        setUserStats(stats);

        // ユーザーのプロフィール画像を取得
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('profile_image_url')
          .eq('id', authUser.id)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', userError);
        } else if (userData?.profile_image_url) {
          setProfileImageUrl(userData.profile_image_url);
        }
      } catch (error) {
        console.error('統計データの取得中にエラーが発生しました:', error);
      }
    };

    fetchUserStats();
  }, [authUser]);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user.quizResults.length) {
        setIsLoading(false);
        return;
      }

      try {
        const quizIds = [...new Set(user.quizResults.map(result => result.quizId))];
        const quizzes: FetchedQuizzes = {};

        await Promise.all(
          quizIds.map(async (quizId) => {
            const quiz = await getQuizById(quizId);
            if (quiz) {
              quizzes[quizId] = {
                title: quiz.title,
                results: quiz.results,
                createdBy: quiz.createdBy,
              };
            }
          })
        );

        setFetchedQuizzes(quizzes);
      } catch (error) {
        console.error('クイズデータの取得中にエラーが発生しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, [user.quizResults, getQuizById]);
  
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <AuthPrompt
          title="プロフィールを表示するにはログインが必要です"
          message="ログインして、クイズの履歴や結果を確認しましょう"
          onAuthClick={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  const handleSaveDisplayName = () => {
    if (typeof newDisplayName === 'string' && newDisplayName.trim()) {
      updateDisplayName(newDisplayName.trim());
      setIsEditing(false);
    }
  };

  const handleProfileImageChange = async (imageUrl: string) => {
    if (!authUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ profile_image_url: imageUrl || null })
        .eq('id', authUser.id);

      if (error) throw error;

      setProfileImageUrl(imageUrl);
    } catch (error) {
      console.error('プロフィール画像の更新に失敗しました:', error);
      alert('プロフィール画像の更新に失敗しました');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.displayName) {
      return;
    }

    setIsDeleting2(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('認証エラー');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'アカウントの削除中にエラーが発生しました');
      }

      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error instanceof Error ? error.message : 'アカウントの削除中にエラーが発生しました');
    } finally {
      setIsDeleting2(false);
    }
  };

  const sortedResults = [...user.quizResults].sort((a, b) => {
    return new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime();
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* ヘッダーセクション */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <ProfileAvatar
              displayName={user.displayName}
              profileImageUrl={profileImageUrl}
              size="xl"
              editable={true}
              onImageChange={handleProfileImageChange}
            />
            {isPremium && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1.5">
                <Crown className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="input text-xl font-bold px-3 py-1"
                    placeholder="表示名を入力"
                    maxLength={30}
                  />
                  <button
                    onClick={handleSaveDisplayName}
                    className="btn-primary p-2"
                    title="保存"
                  >
                    <Save className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewDisplayName(user.displayName);
                    }}
                    className="btn-outline p-2"
                    title="キャンセル"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{user.displayName}</h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-primary-600 p-1"
                    title="名前を編集"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </>
              )}
              {isPremium && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              本日の相談チケット: {quizzesRemaining}枚 / {dailyLimit}枚
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <button 
                onClick={() => setShowSettings(true)}
                className="btn-outline flex items-center text-gray-600 hover:text-gray-800"
              >
                <Settings className="h-4 w-4 mr-1.5" />
                設定
              </button>
              {!isPremium && (
                <button 
                  onClick={() => setIsPremium(true)}
                  className="btn-primary flex items-center text-sm"
                >
                  <Gift className="h-4 w-4 mr-1.5" />
                  プレミアムに登録
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 設定モーダル */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">設定</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
                aria-label="閉じる"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">アカウント管理</h3>
                <p className="text-xs text-gray-600 mb-3">
                  アカウントを削除すると、すべてのデータが完全に削除されます。この操作は取り消せません。
                </p>
                <button 
                  onClick={() => {
                    setShowSettings(false);
                    setIsDeleting(true);
                  }} 
                  className="w-full btn-outline flex items-center justify-center text-red-600 hover:bg-red-50 hover:border-red-200"
                  disabled={isDeleting2}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {isDeleting2 ? '削除中...' : 'アカウントを削除'}
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full btn-primary"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アカウント削除モーダル */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">アカウントを削除</h2>
              <p className="text-gray-600 text-sm">
                この操作は取り消せません。アカウントを削除すると、すべての相談データが完全に削除されます。
              </p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                確認のため、表示名「<span className="font-bold text-red-600">{user.displayName}</span>」を入力してください
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="input"
                placeholder={user.displayName}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== user.displayName || isDeleting2}
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isDeleting2 ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    削除中...
                  </>
                ) : (
                  'アカウントを削除'
                )}
              </button>
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteConfirmation('');
                }}
                className="btn-outline"
                disabled={isDeleting2}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ログインストリーク表示 */}
      <div className="mb-8">
        <LoginStreakDisplay
          consecutiveLoginDays={user.consecutiveLoginDays}
          lastLoginDate={user.lastLoginDate}
        />
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="bg-primary-100 rounded-full p-3">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">作成した相談</h3>
              <p className="text-3xl font-bold text-primary-600 mt-1">
                {userStats.createdQuizzes}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="bg-secondary-100 rounded-full p-3">
              <History className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">答えてもらった相談</h3>
              <p className="text-3xl font-bold text-secondary-600 mt-1">
                {sortedResults.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start">
            <div className="bg-yellow-100 rounded-full p-3">
              <Heart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold">獲得いいね</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {userStats.totalLikes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 診断履歴 */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">相談履歴</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">相談履歴を読み込み中...</p>
          </div>
        ) : sortedResults.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {sortedResults.map((result) => {
              const quiz = fetchedQuizzes[result.quizId];
              if (!quiz) return null;
              
              const quizResult = quiz.results.find(r => r.id === result.resultId);
              if (!quizResult) return null;
              
              const isCreator = quiz.createdBy === authUser?.id;
              
              return (
                <div 
                  key={result.takenAt} 
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/results/${result.quizId}?result=${result.resultId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {quizResult.imageUrl ? (
                        <img 
                          src={quizResult.imageUrl} 
                          alt={quizResult.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{quiz.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-primary-600">
                            結果: {quizResult.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            作成者: {isCreator ? user.displayName : 'ゲストユーザー'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-3">
                        {formatDate(result.takenAt)}
                      </span>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              まだ相談履歴がありません
            </h3>
            <p className="text-gray-600 mb-6">
              質問に答えて、答えを発見しましょう！
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="btn-primary"
            >
              相談内容を探す
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;