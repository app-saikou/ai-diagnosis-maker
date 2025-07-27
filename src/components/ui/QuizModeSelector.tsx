import React, { FC } from "react";
import { useUser } from "../../contexts/UserContext";
import { useQuiz } from "../../contexts/QuizContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { QuizMode } from "../../types";
import { Zap, ZapOff, Lock } from "lucide-react";

interface QuizModeSelectorProps {
  selectedMode: QuizMode;
  onSelectMode: (mode: QuizMode) => void;
}

const QuizModeSelector: FC<QuizModeSelectorProps> = ({
  selectedMode,
  onSelectMode,
}) => {
  const { isPremium } = useUser();
  const { quizModes } = useQuiz();
  const { t } = useLanguage();

  const handleModeSelect = (mode: QuizMode) => {
    if (isPremium || quizModes[mode].availableToFree) {
      onSelectMode(mode);
    }
  };

  const modeNames = {
    quick: t("quick"),
    standard: t("standard"),
    deep: t("deep"),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {(Object.keys(quizModes) as QuizMode[]).map((mode) => {
        const { questionCount, availableToFree } = quizModes[mode];
        const isLocked = !isPremium && !availableToFree;
        const isSelected = mode === selectedMode;
        const modeName = modeNames[mode];

        return (
          <div
            key={mode}
            onClick={() => handleModeSelect(mode)}
            className={`
              relative rounded-lg border-2 p-4 cursor-pointer transition-all
              ${
                isSelected
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-primary-200"
              }
              ${isLocked ? "opacity-80" : ""}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-medium">{modeName}</h3>
              {isLocked ? (
                <Lock className="h-4 w-4 text-gray-400" />
              ) : isSelected ? (
                <Zap className="h-4 w-4 text-primary-500" />
              ) : (
                <ZapOff className="h-4 w-4 text-gray-400" />
              )}
            </div>

            <p className="text-sm text-gray-600">
              {t("questions").replace("{count}", questionCount.toString())}
            </p>

            {isLocked && (
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center rounded-lg">
                <div className="bg-primary-600 text-white text-xs py-1 px-2 rounded">
                  {t("premiumOnly")}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuizModeSelector;
