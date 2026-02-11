import React, { useEffect, useState } from 'react';
import { riskCalculatorService, Broker } from '../../../services/riskCalculator';
import LoadingSpinner from '../Shared/LoadingSpinner';

interface BrokerSelectorProps {
  value: string;
  onChange: (broker: string) => void;
  className?: string;
}

const BrokerSelector: React.FC<BrokerSelectorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getBrokers();
      setBrokers(response.brokers);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load brokers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <LoadingSpinner size="sm" text="Loading brokers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Broker
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white"
      >
        <option value="">Select a broker</option>
        {brokers.map((broker) => (
          <option key={broker.broker} value={broker.broker}>
            {broker.name}
          </option>
        ))}
      </select>

      {/* Show broker fee info */}
      {value && brokers.find(b => b.broker === value) && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Brokerage:</strong> {
              brokers.find(b => b.broker === value)?.profiles.delivery.brokerage_type === 'percentage'
                ? `${brokers.find(b => b.broker === value)?.profiles.delivery.brokerage}%`
                : `₹${brokers.find(b => b.broker === value)?.profiles.delivery.brokerage}`
            } (Delivery) | {
              brokers.find(b => b.broker === value)?.profiles.intraday.brokerage_type === 'percentage'
                ? `${brokers.find(b => b.broker === value)?.profiles.intraday.brokerage}%`
                : `₹${brokers.find(b => b.broker === value)?.profiles.intraday.brokerage}`
            } (Intraday)
          </p>
        </div>
      )}
    </div>
  );
};

export default BrokerSelector;
