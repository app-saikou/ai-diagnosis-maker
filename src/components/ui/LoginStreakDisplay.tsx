import { FC } from 'react';
import { Calendar, Flame, Trophy, Star } from 'lucide-react';

interface LoginStreakDisplayProps {
  consecutiveLoginDays: number;
  lastLoginDate?: string;
}

const LoginStreakDisplay: FC<LoginStreakDisplayProps> = ({
  consecutiveLoginDays,
  lastLoginDate
}) => {
  // JST日付文字列を取得する関数
  const getJSTDateString = (date: Date): string => {
    const jstOffset = 9 * 60; // JST is UTC+9
    const jstTime = new Date(date.getTime() + (jstOffset * 60 * 1000));
    return jstTime.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Generate the last 7 days for the mini calendar
  const generateLastSevenDays = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const jstDateString = getJSTDateString(date);
      
      days.push({
        date: jstDateString,
        dayOfWeek: date.toLocaleDateString('ja-JP', { weekday: 'short' }),
        day: date.getDate(),
        isToday: i === 0
      });
    }
    
    return days;
  };

  // Check if a date is within the login streak
  const isLoginDay = (dateString: string) => {
    if (!lastLoginDate || consecutiveLoginDays === 0) return false;
    
    // Parse dates as UTC to avoid timezone issues
    const checkDate = new Date(dateString + 'T00:00:00.000Z');
    const lastLogin = new Date(lastLoginDate + 'T00:00:00.000Z');
    
    // Calculate difference in days using UTC time
    const daysDiff = Math.floor((lastLogin.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If the date is within the consecutive login period
    return daysDiff >= 0 && daysDiff < consecutiveLoginDays;
  };

  const days = generateLastSevenDays();

  // Get streak level and color based on consecutive days
  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: 'レジェンド', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Trophy };
    if (days >= 14) return { level: 'エキスパート', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Star };
    if (days >= 7) return { level: 'ベテラン', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Flame };
    if (days >= 3) return { level: 'アクティブ', color: 'text-green-600', bgColor: 'bg-green-100', icon: Flame };
    return { level: 'ビギナー', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Calendar };
  };

  const streakInfo = getStreakLevel(consecutiveLoginDays);
  const StreakIcon = streakInfo.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`${streakInfo.bgColor} rounded-full p-3 mr-4`}>
            <StreakIcon className={`h-6 w-6 ${streakInfo.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ログインストリーク</h3>
            <p className="text-sm text-gray-600">連続ログイン記録</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">{consecutiveLoginDays}</div>
          <div className="text-sm text-gray-600">日連続</div>
        </div>
      </div>

      {/* Streak Level Badge */}
      <div className="mb-6">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${streakInfo.bgColor} ${streakInfo.color}`}>
          <StreakIcon className="h-4 w-4 mr-1" />
          {streakInfo.level}
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">過去7日間のログイン状況</h4>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const isLogin = isLoginDay(day.date);
            const isToday = day.isToday;
            
            return (
              <div key={index} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day.dayOfWeek}</div>
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                    ${isLogin 
                      ? 'bg-primary-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-400'}
                    ${isToday && isLogin ? 'ring-2 ring-primary-300 ring-offset-2' : ''}
                    ${isToday && !isLogin ? 'ring-2 ring-gray-300 ring-offset-2' : ''}
                  `}
                  title={`${day.date} ${isLogin ? 'ログイン済み' : 'ログインなし'}`}
                >
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
        <p className="text-sm text-gray-700">
          {consecutiveLoginDays === 0 && (
            <span>今日からログインストリークを始めましょう！🚀</span>
          )}
          {consecutiveLoginDays >= 1 && consecutiveLoginDays < 3 && (
            <span>いいスタートです！継続は力なり💪</span>
          )}
          {consecutiveLoginDays >= 3 && consecutiveLoginDays < 7 && (
            <span>素晴らしい継続力です！この調子で頑張りましょう🔥</span>
          )}
          {consecutiveLoginDays >= 7 && consecutiveLoginDays < 14 && (
            <span>1週間連続ログイン達成！あなたは真のベテランです⭐</span>
          )}
          {consecutiveLoginDays >= 14 && consecutiveLoginDays < 30 && (
            <span>2週間連続は驚異的！エキスパートレベルです🏆</span>
          )}
          {consecutiveLoginDays >= 30 && (
            <span>30日連続ログイン！あなたはレジェンドです👑</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginStreakDisplay;