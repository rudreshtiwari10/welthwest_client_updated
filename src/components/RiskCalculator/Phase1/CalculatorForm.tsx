import React, { useState } from 'react';
import { riskCalculatorService, RiskCalculatorRequest } from '../../../services/riskCalculator';
import BrokerSelector from './BrokerSelector';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface CalculatorFormProps {
  onCalculate: (result: any) => void;
  loading?: boolean;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({
  onCalculate,
  loading = false
}) => {
  const [formData, setFormData] = useState<RiskCalculatorRequest>({
    symbol: '',
    trade_type: 'delivery',
    buy_price: 0,
    stop_loss_price: 0,
    target_price: null,
    capital_available: 0,
    max_risk_per_trade: 0,
    max_risk_type: 'percentage',
    broker: 'zerodha'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (formData.buy_price <= 0) {
      newErrors.buy_price = 'Buy price must be greater than 0';
    }

    if (formData.stop_loss_price <= 0) {
      newErrors.stop_loss_price = 'Stop loss must be greater than 0';
    }

    if (formData.stop_loss_price >= formData.buy_price) {
      newErrors.stop_loss_price = 'Stop loss must be less than buy price';
    }

    if (formData.target_price && formData.target_price <= formData.buy_price) {
      newErrors.target_price = 'Target must be greater than buy price';
    }

    if (formData.capital_available <= 0) {
      newErrors.capital_available = 'Capital must be greater than 0';
    }

    if (formData.max_risk_per_trade <= 0) {
      newErrors.max_risk_per_trade = 'Max risk must be greater than 0';
    }

    if (!formData.broker) {
      newErrors.broker = 'Please select a broker';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await riskCalculatorService.calculate(formData);
      onCalculate(result);
    } catch (error: any) {
      setErrors({ submit: error.message || 'Calculation failed' });
    }
  };

  const handleInputChange = (field: keyof RiskCalculatorRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Symbol */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stock Symbol <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
          placeholder="e.g., RELIANCE, TCS"
          className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white ${
            errors.symbol ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.symbol && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.symbol}</p>}
      </div>

      {/* Trade Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trade Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'delivery', label: 'Delivery' },
            { value: 'intraday', label: 'Intraday' },
            { value: 'fno', label: 'F&O' }
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleInputChange('trade_type', type.value)}
              className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                formData.trade_type === type.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-primary-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Inputs Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Buy Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buy Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.buy_price || ''}
            onChange={(e) => handleInputChange('buy_price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white ${
              errors.buy_price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.buy_price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.buy_price}</p>}
        </div>

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Stop Loss (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.stop_loss_price || ''}
            onChange={(e) => handleInputChange('stop_loss_price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white ${
              errors.stop_loss_price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.stop_loss_price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.stop_loss_price}</p>}
        </div>

        {/* Target Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Price (₹) <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.target_price || ''}
            onChange={(e) => handleInputChange('target_price', parseFloat(e.target.value) || null)}
            placeholder="0.00"
            className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white ${
              errors.target_price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.target_price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.target_price}</p>}
        </div>
      </div>

      {/* Capital Available */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Capital Available (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.capital_available || ''}
          onChange={(e) => handleInputChange('capital_available', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white ${
            errors.capital_available ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {errors.capital_available && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.capital_available}</p>}
      </div>

      {/* Risk Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Max Risk */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max Risk Per Trade <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.max_risk_per_trade || ''}
            onChange={(e) => handleInputChange('max_risk_per_trade', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className={`w-full px-4 py-2 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white ${
              errors.max_risk_per_trade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          />
          {errors.max_risk_per_trade && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.max_risk_per_trade}</p>}
        </div>

        {/* Risk Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Risk Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.max_risk_type}
            onChange={(e) => handleInputChange('max_risk_type', e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="rupees">Rupees (₹)</option>
          </select>
        </div>
      </div>

      {/* Broker Selection */}
      <BrokerSelector
        value={formData.broker}
        onChange={(broker) => handleInputChange('broker', broker)}
      />

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>Calculating...</span>
          </div>
        ) : (
          'Calculate Position Size'
        )}
      </button>
    </form>
  );
};

export default CalculatorForm;
