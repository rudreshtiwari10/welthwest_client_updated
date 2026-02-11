import React from 'react';
import { TradeQualityScore as TradeQualityScoreType } from '../../../services/riskCalculator';

interface TradeQualityScoreProps {
  quality: TradeQualityScoreType;
  className?: string;
}

const TradeQualityScore: React.FC<TradeQualityScoreProps> = ({
  quality,
  className = ''
}) => {
  const scorePercentage = (quality.score / quality.max_score) * 100;

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  const colorClasses = getColorClasses(quality.quality_color);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Trade Quality Score
      </h3>

      {/* Score Display */}
      <div className={`p-6 rounded-lg border ${colorClasses} text-center mb-4`}>
        <div className="text-5xl font-bold mb-2">
          {quality.score}/{quality.max_score}
        </div>
        <div className="text-lg font-semibold uppercase tracking-wide">
          {quality.quality_level}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              scorePercentage >= 80 ? 'bg-green-500' :
              scorePercentage >= 60 ? 'bg-yellow-500' :
              scorePercentage >= 40 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          {quality.message}
        </p>
      </div>

      {/* Factors */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quality Factors:
        </p>
        <ul className="space-y-1">
          {quality.factors.map((factor, index) => (
            <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {quality.disclaimer}
        </p>
      </div>
    </div>
  );
};

export default TradeQualityScore;
