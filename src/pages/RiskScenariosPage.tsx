import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BeakerIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';

interface SimulationResult {
  _id: string;
  type: 'cost' | 'risk' | 'drawdown';
  created_at: string;
  parameters: any;
  results: any;
}

const RiskScenariosPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'cost' | 'risk' | 'drawdown'>('cost');
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Cost simulation params
  const [costParams, setCostParams] = useState({
    symbol: '',
    trade_type: 'delivery',
    broker: 'zerodha',
    entry_price: '',
    quantity: '',
    target_prices: ['', '', '']
  });

  // Risk simulation params
  const [riskParams, setRiskParams] = useState({
    capital: '',
    max_risk_percent: '',
    num_trades: '',
    avg_win_rate: ''
  });

  // Drawdown simulation params
  const [drawdownParams, setDrawdownParams] = useState({
    starting_capital: '',
    max_drawdown_percent: '',
    recovery_scenarios: '',
    num_simulations: '1000'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadSimulations();
    }
  }, [isAuthenticated, activeTab]);

  const loadSimulations = async () => {
    try {
      const response = await riskCalculatorService.getSimulations(activeTab);
      if (response.success) {
        setSimulations(response.simulations || []);
      }
    } catch (err) {
      console.error('Failed to load simulations:', err);
    }
  };

  const handleCostSimulation = async () => {
    setLoading(true);
    try {
      const response = await riskCalculatorService.simulateCosts({
        ...costParams,
        entry_price: parseFloat(costParams.entry_price),
        quantity: parseInt(costParams.quantity),
        target_prices: costParams.target_prices.filter(p => p).map(p => parseFloat(p))
      });

      if (response.success) {
        setResults(response);
        loadSimulations();
      }
    } catch (err: any) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRiskSimulation = async () => {
    setLoading(true);
    try {
      const response = await riskCalculatorService.simulateRisk({
        capital: parseFloat(riskParams.capital),
        max_risk_percent: parseFloat(riskParams.max_risk_percent),
        num_trades: parseInt(riskParams.num_trades),
        avg_win_rate: parseFloat(riskParams.avg_win_rate)
      });

      if (response.success) {
        setResults(response);
        loadSimulations();
      }
    } catch (err: any) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawdownSimulation = async () => {
    setLoading(true);
    try {
      const response = await riskCalculatorService.simulateDrawdown({
        starting_capital: parseFloat(drawdownParams.starting_capital),
        max_drawdown_percent: parseFloat(drawdownParams.max_drawdown_percent),
        recovery_scenarios: parseInt(drawdownParams.recovery_scenarios),
        num_simulations: parseInt(drawdownParams.num_simulations)
      });

      if (response.success) {
        setResults(response);
        loadSimulations();
      }
    } catch (err: any) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to run risk simulations
          </p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-primary">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 dark:from-green-800 dark:to-teal-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <BeakerIcon className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Risk Scenarios</h1>
          </div>
          <p className="text-xl text-green-100">
            Simulate costs, risk exposure, and drawdown scenarios
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg">
          <button
            onClick={() => {
              setActiveTab('cost');
              setResults(null);
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'cost'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CurrencyRupeeIcon className="w-5 h-5 inline mr-2" />
            Cost Simulation
          </button>
          <button
            onClick={() => {
              setActiveTab('risk');
              setResults(null);
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'risk'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ChartBarIcon className="w-5 h-5 inline mr-2" />
            Risk Monte Carlo
          </button>
          <button
            onClick={() => {
              setActiveTab('drawdown');
              setResults(null);
            }}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'drawdown'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <ArrowTrendingDownIcon className="w-5 h-5 inline mr-2" />
            Drawdown Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {activeTab === 'cost' && 'Cost Simulation Parameters'}
                {activeTab === 'risk' && 'Risk Simulation Parameters'}
                {activeTab === 'drawdown' && 'Drawdown Parameters'}
              </h2>

              {/* Cost Simulation Form */}
              {activeTab === 'cost' && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Symbol (e.g., RELIANCE)"
                    value={costParams.symbol}
                    onChange={(e) => setCostParams({ ...costParams, symbol: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={costParams.trade_type}
                    onChange={(e) => setCostParams({ ...costParams, trade_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="intraday">Intraday</option>
                    <option value="fno">F&O</option>
                  </select>
                  <select
                    value={costParams.broker}
                    onChange={(e) => setCostParams({ ...costParams, broker: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="zerodha">Zerodha</option>
                    <option value="upstox">Upstox</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Entry Price"
                    value={costParams.entry_price}
                    onChange={(e) => setCostParams({ ...costParams, entry_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={costParams.quantity}
                    onChange={(e) => setCostParams({ ...costParams, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Prices (up to 3)
                    </label>
                    {[0, 1, 2].map((idx) => (
                      <input
                        key={idx}
                        type="number"
                        placeholder={`Target ${idx + 1} (optional)`}
                        value={costParams.target_prices[idx]}
                        onChange={(e) => {
                          const newTargets = [...costParams.target_prices];
                          newTargets[idx] = e.target.value;
                          setCostParams({ ...costParams, target_prices: newTargets });
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white mb-2"
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleCostSimulation}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {loading ? 'Running...' : 'Run Simulation'}
                  </button>
                </div>
              )}

              {/* Risk Simulation Form */}
              {activeTab === 'risk' && (
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Starting Capital"
                    value={riskParams.capital}
                    onChange={(e) => setRiskParams({ ...riskParams, capital: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max Risk Per Trade (%)"
                    value={riskParams.max_risk_percent}
                    onChange={(e) => setRiskParams({ ...riskParams, max_risk_percent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Number of Trades"
                    value={riskParams.num_trades}
                    onChange={(e) => setRiskParams({ ...riskParams, num_trades: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Average Win Rate (%)"
                    value={riskParams.avg_win_rate}
                    onChange={(e) => setRiskParams({ ...riskParams, avg_win_rate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleRiskSimulation}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {loading ? 'Running...' : 'Run Monte Carlo'}
                  </button>
                </div>
              )}

              {/* Drawdown Simulation Form */}
              {activeTab === 'drawdown' && (
                <div className="space-y-4">
                  <input
                    type="number"
                    placeholder="Starting Capital"
                    value={drawdownParams.starting_capital}
                    onChange={(e) => setDrawdownParams({ ...drawdownParams, starting_capital: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max Drawdown (%)"
                    value={drawdownParams.max_drawdown_percent}
                    onChange={(e) => setDrawdownParams({ ...drawdownParams, max_drawdown_percent: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Recovery Scenarios"
                    value={drawdownParams.recovery_scenarios}
                    onChange={(e) => setDrawdownParams({ ...drawdownParams, recovery_scenarios: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Number of Simulations"
                    value={drawdownParams.num_simulations}
                    onChange={(e) => setDrawdownParams({ ...drawdownParams, num_simulations: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleDrawdownSimulation}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    {loading ? 'Running...' : 'Run Simulation'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Simulation Results
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-auto">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <BeakerIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Run a simulation to see results
                </p>
              </div>
            )}

            {/* Simulation History */}
            {simulations.length > 0 && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Recent Simulations
                </h3>
                <div className="space-y-3">
                  {simulations.slice(0, 5).map((sim) => (
                    <div
                      key={sim._id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => setResults(sim.results)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {sim.type.toUpperCase()} Simulation
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sim.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskScenariosPage;
