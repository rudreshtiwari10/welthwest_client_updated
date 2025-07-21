import React, { useState } from 'react';

interface Indicator {
  id: string;
  name: string;
  parameters: {
    [key: string]: number;
  };
}

interface IndicatorOption {
  id: string;
  name: string;
  defaultParams: {
    [key: string]: number;
  };
}

interface IndicatorSelectorProps {
  availableIndicators: IndicatorOption[];
  selectedIndicators: Indicator[];
  onIndicatorChange: (indicators: Indicator[]) => void;
  logicOperator: 'AND' | 'OR';
  onLogicOperatorChange: (operator: 'AND' | 'OR') => void;
}

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({
  availableIndicators,
  selectedIndicators,
  onIndicatorChange,
  logicOperator,
  onLogicOperatorChange,
}) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string>('');
  const [parameters, setParameters] = useState<{ [key: string]: number }>({});

  const handleIndicatorSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const indicatorId = event.target.value;
    setSelectedIndicatorId(indicatorId);
    
    if (indicatorId) {
      const indicator = availableIndicators.find((i) => i.id === indicatorId);
      if (indicator) {
        setParameters(indicator.defaultParams);
      }
    } else {
      setParameters({});
    }
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: Number(value),
    }));
  };

  const handleAddIndicator = () => {
    if (selectedIndicatorId) {
      const indicator = availableIndicators.find((i) => i.id === selectedIndicatorId);
      if (indicator) {
        const newIndicator: Indicator = {
          id: selectedIndicatorId,
          name: indicator.name,
          parameters,
        };
        onIndicatorChange([...selectedIndicators, newIndicator]);
        setSelectedIndicatorId('');
        setParameters({});
      }
    }
  };

  const handleRemoveIndicator = (index: number) => {
    const newIndicators = selectedIndicators.filter((_, i) => i !== index);
    onIndicatorChange(newIndicators);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logic Operator
        </label>
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded-md ${
              logicOperator === 'AND'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => onLogicOperatorChange('AND')}
          >
            AND
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              logicOperator === 'OR'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => onLogicOperatorChange('OR')}
          >
            OR
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Add Indicator
        </label>
        <select
          value={selectedIndicatorId}
          onChange={handleIndicatorSelect}
          className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
        >
          <option value="">Select an indicator</option>
          {availableIndicators.map((indicator) => (
            <option key={indicator.id} value={indicator.id}>
              {indicator.name}
            </option>
          ))}
        </select>

        {selectedIndicatorId && (
          <div className="space-y-4">
            {Object.entries(parameters).map(([paramName, value]) => (
              <div key={paramName}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleParameterChange(paramName, e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700"
                />
              </div>
            ))}
            <button
              onClick={handleAddIndicator}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Indicator
            </button>
          </div>
        )}
      </div>

      {selectedIndicators.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Selected Indicators
          </h3>
          <div className="space-y-2">
            {selectedIndicators.map((indicator, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {indicator.name}
                  </h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {Object.entries(indicator.parameters).map(([key, value]) => (
                      <span key={key} className="mr-2">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveIndicator(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicatorSelector; 