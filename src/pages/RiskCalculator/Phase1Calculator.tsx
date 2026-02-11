import React, { useState } from 'react';
import SEBIDisclaimer from '../../components/RiskCalculator/Shared/SEBIDisclaimer';
import CalculatorForm from '../../components/RiskCalculator/Phase1/CalculatorForm';
import PositionSizeCard from '../../components/RiskCalculator/Phase1/PositionSizeCard';
import CostBreakdownTable from '../../components/RiskCalculator/Phase1/CostBreakdownTable';

const Phase1Calculator: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  const handleCalculate = (calculationResult: any) => {
    setResult(calculationResult);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Position Size & Cost Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Calculate optimal position size based on your risk tolerance and get detailed cost breakdown
        </p>
      </div>

      {/* SEBI Disclaimer */}
      <SEBIDisclaimer variant="compact" />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Calculator Form */}
        <div>
          <CalculatorForm
            onCalculate={handleCalculate}
            loading={calculating}
          />
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {result ? (
            <>
              <PositionSizeCard result={result} />
              <CostBreakdownTable result={result} />
            </>
          ) : (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-primary-200 dark:border-gray-600 p-12 text-center">
              <div className="max-w-sm mx-auto">
                <svg
                  className="w-24 h-24 mx-auto text-primary-300 dark:text-gray-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Enter Trade Details
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fill in the form on the left to calculate your recommended position size and see detailed cost breakdown
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            What is Position Sizing?
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Position sizing determines how many shares to buy based on your risk tolerance, ensuring you never risk more than you can afford to lose.
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Why Calculate Costs?
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Trading costs (brokerage, taxes, charges) can significantly impact your profit. Know your true breakeven price before entering a trade.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Risk:Reward Ratio
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            A good R:R ratio (minimum 1:2) ensures your potential profit is worth the risk you're taking. Aim for ratios above 1:2 for better trading outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Phase1Calculator;
