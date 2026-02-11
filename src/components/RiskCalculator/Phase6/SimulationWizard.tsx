import React, { useState } from 'react';
import CostSimulationForm from './CostSimulationForm';
import RiskSimulationForm from './RiskSimulationForm';
import DrawdownSimulationForm from './DrawdownSimulationForm';
import SimulationResults from './SimulationResults';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SimulationWizardProps {
  className?: string;
}

const SimulationWizard: React.FC<SimulationWizardProps> = ({
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [simulationType, setSimulationType] = useState<'cost' | 'risk' | 'drawdown'>('cost');
  const [results, setResults] = useState<any>(null);

  const steps = [
    { number: 1, title: 'Select Type', description: 'Choose simulation type' },
    { number: 2, title: 'Configure', description: 'Set parameters' },
    { number: 3, title: 'Results', description: 'View simulation' }
  ];

  const handleTypeSelection = (type: 'cost' | 'risk' | 'drawdown') => {
    setSimulationType(type);
    setCurrentStep(2);
  };

  const handleSimulationComplete = (data: any) => {
    setResults(data);
    setCurrentStep(3);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSimulationType('cost');
    setResults(null);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : currentStep === step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition-colors ${
                  currentStep > step.number
                    ? 'bg-green-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Simulation Type
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select what you'd like to simulate
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cost Simulation */}
        <button
          onClick={() => handleTypeSelection('cost')}
          className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Cost Simulation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Project monthly trading costs based on frequency and broker fees
          </p>
        </button>

        {/* Risk Simulation */}
        <button
          onClick={() => handleTypeSelection('risk')}
          className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Risk Simulation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Simulate potential outcomes based on win rate and average win/loss
          </p>
        </button>

        {/* Drawdown Simulation */}
        <button
          onClick={() => handleTypeSelection('drawdown')}
          className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Drawdown Simulation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monte Carlo simulation to estimate maximum drawdown scenarios
          </p>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => {
    switch (simulationType) {
      case 'cost':
        return <CostSimulationForm onComplete={handleSimulationComplete} />;
      case 'risk':
        return <RiskSimulationForm onComplete={handleSimulationComplete} />;
      case 'drawdown':
        return <DrawdownSimulationForm onComplete={handleSimulationComplete} />;
      default:
        return null;
    }
  };

  const renderStep3 = () => {
    if (!results) return null;
    return (
      <SimulationResults
        type={simulationType}
        results={results}
        onReset={handleReset}
      />
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Simulation Wizard</h1>
        <p className="text-primary-100">
          Run What-If scenarios to plan your trading strategy
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {renderStepIndicator()}

        <div className="mt-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        {currentStep === 2 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationWizard;
