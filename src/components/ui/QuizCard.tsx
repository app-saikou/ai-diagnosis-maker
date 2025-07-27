import { FC } from "react";
import { Link } from "react-router-dom";
import { Clock, User, ThumbsUp } from "lucide-react";
import { Quiz } from "../../types";

interface QuizCardProps {
  quiz: Quiz;
  className?: string;
}

const QuizCard: FC<QuizCardProps> = ({ quiz, className = "" }) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className={`card card-hover ${className}`}>
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {quiz.title}
          </h3>
          <div className="flex items-center text-gray-500 text-xs">
            <Clock className="h-3.5 w-3.5 mr-1" />
            <span>{formatDate(quiz.createdAt)}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {quiz.description}
        </p>

        {/* 作成者名を表示 */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <User className="h-3.5 w-3.5 mr-1" />
          <span>作成者: {quiz.creatorDisplayName}</span>
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex space-x-3 text-xs text-gray-500">
            <div className="flex items-center">
              <User className="h-3.5 w-3.5 mr-1" />
              <span>{quiz.completions}回相談</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="h-3.5 w-3.5 mr-1" />
              <span>{quiz.likes}いいね</span>
            </div>
          </div>

          <Link
            to={`/quiz/${quiz.id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            相談を始める
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
