import { useState } from 'react';
import { User, Upload, X } from 'lucide-react';

interface ProfileAvatarProps {
  displayName: string;
  profileImageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onImageChange?: (imageUrl: string) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  displayName,
  profileImageUrl,
  size = 'xl',
  editable = false,
  onImageChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  // ユーザーネームの頭文字を取得
  const getInitials = (name: string) => {
    if (!name) return 'U';
    
    // 日本語の場合は最初の文字、英語の場合は最初の文字の大文字
    const firstChar = name.charAt(0);
    if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(firstChar)) {
      return firstChar; // ひらがな、カタカナ、漢字
    }
    return firstChar.toUpperCase(); // 英語
  };

  // 背景色をユーザーネームから生成
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl || !onImageChange) return;

    setIsUploading(true);
    try {
      // 実際のアプリケーションでは、ここでSupabase Storageにアップロード
      // 今回はBase64データをそのまま保存（デモ用）
      onImageChange(previewUrl);
      setShowUploadModal(false);
      setPreviewUrl(null);
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (onImageChange) {
      onImageChange('');
    }
  };

  const handleAvatarClick = () => {
    if (editable) {
      setShowUploadModal(true);
    }
  };

  return (
    <>
      <div 
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white relative
          ${profileImageUrl ? '' : getBackgroundColor(displayName)}
          ${editable ? 'cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105' : ''}
        `}
        onClick={handleAvatarClick}
        title={editable ? 'プロフィール画像を変更' : undefined}
      >
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={displayName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          getInitials(displayName)
        )}
        
        {/* 編集可能な場合のオーバーレイ */}
        {editable && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
              <Upload className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* アップロードモーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">プロフィール画像を変更</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 現在の画像プレビュー */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center font-semibold text-white text-2xl bg-gray-200">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="プレビュー"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className={`${getBackgroundColor(displayName)} w-full h-full rounded-full flex items-center justify-center`}>
                      {getInitials(displayName)}
                    </span>
                  )}
                </div>
              </div>

              {/* ファイル選択 */}
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      クリックして画像を選択
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF (最大5MB)
                    </p>
                  </div>
                </label>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col gap-3">
                {previewUrl && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        アップロード中...
                      </>
                    ) : (
                      '画像を設定'
                    )}
                  </button>
                )}

                {profileImageUrl && (
                  <button
                    onClick={handleRemoveImage}
                    className="btn-outline w-full text-red-600 hover:bg-red-50 hover:border-red-200"
                  >
                    画像を削除
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setPreviewUrl(null);
                  }}
                  className="btn-outline w-full"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileAvatar;