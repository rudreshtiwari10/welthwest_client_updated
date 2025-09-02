import React, { useState } from 'react';
import { hmmService } from '../services/api';
import { 
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';

const HMMTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<{[key: string]: any}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [testTicker] = useState('RELIANCE');

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [testName]: { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
    setLoading(prev => ({ ...prev, [testName]: false }));
  };

  const tests = [
    {
      name: 'HMM Prediction',
      key: 'prediction',
      fn: () => hmmService.predict(testTicker),
      description: 'Test basic HMM regime prediction'
    },
    {
      name: 'HMM Analysis',
      key: 'analysis',
      fn: () => hmmService.analyze(testTicker, '6mo'),
      description: 'Test HMM regime persistence analysis'
    },
    {
      name: 'Model Info',
      key: 'modelInfo',
      fn: () => hmmService.getModelInfo(),
      description: 'Test HMM model information (requires auth)'
    },
    {
      name: 'Anonymous Analysis',
      key: 'anonymous',
      fn: () => hmmService.anonymousAnalysis(testTicker),
      description: 'Test anonymous HMM analysis'
    },
    {
      name: 'Multiple Predictions',
      key: 'multiple',
      fn: () => hmmService.getMultiplePredictions([testTicker, 'TCS']),
      description: 'Test multiple ticker predictions (requires auth)'
    }
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await runTest(test.key, test.fn);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
  };

  const getStatusIcon = (testKey: string) => {
    if (loading[testKey]) {
      return <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>;
    }
    
    const result = testResults[testKey];
    if (!result) return null;
    
    if (result.success) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    } else {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <CpuChipIcon className="h-8 w-8 mr-3 text-purple-600" />
            HMM Endpoint Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test all HMM (Hidden Markov Model) API endpoints for functionality
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Configuration</h2>
            <button
              onClick={runAllTests}
              disabled={Object.values(loading).some(l => l)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center"
            >
              <PlayIcon className="h-4 w-4 mr-2" />
              Run All Tests
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Test Ticker: <span className="font-semibold">{testTicker}</span>
          </div>
        </div>

        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.key} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    {getStatusIcon(test.key)}
                    <span className="ml-2">{test.name}</span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{test.description}</p>
                </div>
                <button
                  onClick={() => runTest(test.key, test.fn)}
                  disabled={loading[test.key]}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Test
                </button>
              </div>

              {testResults[test.key] && (
                <div className="mt-3">
                  {testResults[test.key].success ? (
                    <div>
                      <div className="text-sm text-green-700 dark:text-green-400 font-medium mb-2">
                        ✅ Test Passed
                      </div>
                      <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(testResults[test.key].data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                        ❌ Test Failed
                      </div>
                      <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded text-sm text-red-800 dark:text-red-200">
                        {testResults[test.key].error}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Expected Results
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>HMM Prediction:</strong> Should return regime prediction with probabilities</li>
            <li>• <strong>HMM Analysis:</strong> Should return regime persistence and transition data</li>
            <li>• <strong>Model Info:</strong> May fail with 401 if not authenticated as admin</li>
            <li>• <strong>Anonymous Analysis:</strong> Should work without authentication</li>
            <li>• <strong>Multiple Predictions:</strong> May fail with 401 if not authenticated</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HMMTestPage;