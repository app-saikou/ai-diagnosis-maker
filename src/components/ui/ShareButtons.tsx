import { FC } from "react";
import { Link as LinkIcon } from "lucide-react";
import xLogo from "../../assets/logo-white.png";
import { ShareMetadata } from "../../types";

const ShareButtons: FC<ShareMetadata> = ({ url, title }) => {
  // タイトルから相談名と結果を抽出
  const [resultTitle, quizTitle] = title.split(" - ").reverse();

  // 新しい共有テキストフォーマット
  const shareText = `AIだけど何か相談ある？で相談したよ！\n\n${resultTitle}\n- ${quizTitle}\n\n今すぐあなたも相談しよう👇`;

  const encodedUrl = encodeURIComponent(url);
  const encodedShareText = encodeURIComponent(shareText);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedUrl}`;

  const copyToClipboard = async () => {
    try {
      const textToCopy = `${shareText}\n${url}`;
      await navigator.clipboard.writeText(textToCopy);
      alert("リンクをコピーしました！");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex space-x-2">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full bg-[#1A1A1A] text-white hover:bg-opacity-90 transition-colors"
        >
          <img src={xLogo} alt="X" className="h-5 w-5" />
        </a>

        <button
          onClick={copyToClipboard}
          className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          <LinkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
