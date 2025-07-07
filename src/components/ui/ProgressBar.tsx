import { FC } from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  showSteps?: boolean;
}

const ProgressBar: FC<ProgressBarProps> = ({ 
  current, 
  total, 
  showSteps = true 
}) => {
  const percent = (current / total) * 100;
  
  // Generate step markers
  const steps = [];
  if (showSteps) {
    for (let i = 1; i <= total; i++) {
      const isCompleted = i <= current;
      const isActive = i === current;
      
      steps.push(
        <div 
          key={i}
          className={`
            absolute h-4 w-4 rounded-full transition-all
            ${isCompleted 
              ? 'bg-primary-600' 
              : 'bg-gray-200'}
            ${isActive 
              ? 'ring-4 ring-primary-100' 
              : ''}
          `}
          style={{ 
            left: `${((i - 1) / (total - 1)) * 100}%`,
            transform: 'translate(-50%, -25%)',
            zIndex: 10
          }}
        >
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
            {i}
          </span>
        </div>
      );
    }
  }
  
  return (
    <div className="relative pt-1 pb-8">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100">
            Progress
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-primary-600">
            {current} of {total}
          </span>
        </div>
      </div>
      
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        ></div>
        
        {showSteps && steps}
      </div>
    </div>
  );
};

export default ProgressBar;