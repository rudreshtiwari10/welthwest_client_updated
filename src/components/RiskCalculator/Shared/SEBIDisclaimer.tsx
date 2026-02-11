import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SEBIDisclaimerProps {
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

const SEBIDisclaimer: React.FC<SEBIDisclaimerProps> = ({
  variant = 'default',
  className = ''
}) => {
  const disclaimerText = {
    default: (
      <>
        <strong>SEBI Disclaimer:</strong> The calculations and recommendations provided are for informational and educational purposes only.
        This is not investment advice or a recommendation to buy or sell any security. All investments are subject to market risks.
        Please consult your financial advisor before making any investment decisions. Past performance is not indicative of future results.
      </>
    ),
    compact: (
      <>
        <strong>Disclaimer:</strong> For informational purposes only. Not investment advice. Market risks apply.
      </>
    ),
    inline: (
      <>Not investment advice. Theoretical illustration only. Consult your advisor.</>
    )
  };

  const variantStyles = {
    default: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    compact: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    inline: 'text-gray-500 dark:text-gray-400 text-xs'
  };

  if (variant === 'inline') {
    return (
      <p className={`${variantStyles.inline} ${className}`}>
        {disclaimerText.inline}
      </p>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">
          {disclaimerText[variant]}
        </p>
      </div>
    </div>
  );
};

export default SEBIDisclaimer;
