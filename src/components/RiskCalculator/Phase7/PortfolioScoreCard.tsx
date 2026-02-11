import React from 'react';

interface PortfolioScoreCardProps {
  score: number;
}

const PortfolioScoreCard: React.FC<PortfolioScoreCardProps> = ({ score }) => {
  const getGrade = (s: number) => {
    if (s >= 90) return 'A+';
    if (s >= 80) return 'A';
    if (s >= 70) return 'B';
    if (s >= 60) return 'C';
    return 'D';
  };

  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-600 dark:text-green-400';
    if (s >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
        Portfolio Risk Score
      </h3>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${(score / 100) * 502.4} 502.4`}
              className={getColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${getColor(score)}`}>
              {getGrade(score)}
            </span>
            <span className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-2">
              {score}/100
            </span>
          </div>
        </div>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-4">
          {score >= 80
            ? 'Excellent risk management'
            : score >= 60
            ? 'Good, room for improvement'
            : 'Review your risk parameters'}
        </p>
      </div>
    </div>
  );
};

export default PortfolioScoreCard;
