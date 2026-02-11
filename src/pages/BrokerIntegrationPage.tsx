import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import {
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { riskCalculatorService } from '../services/riskCalculator';

interface BrokerStatus {
  broker: string;
  connected: boolean;
  last_sync: string | null;
  positions_count: number;
  trades_synced: number;
}

interface SyncHistory {
  _id: string;
  broker: string;
  sync_type: 'positions' | 'trades';
  status: 'success' | 'failed' | 'in_progress';
  records_synced: number;
  timestamp: string;
  error_message?: string;
}

const AVAILABLE_BROKERS = [
  {
    id: 'zerodha',
    name: 'Zerodha',
    logo: '🔵',
    description: 'Connect your Zerodha account via Kite Connect API'
  },
  {
    id: 'upstox',
    name: 'Upstox',
    logo: '🟣',
    description: 'Integrate with Upstox Pro API'
  },
  {
    id: 'angelone',
    name: 'Angel One',
    logo: '🔴',
    description: 'Connect using Angel One Smart API'
  },
  {
    id: 'fyers',
    name: 'Fyers',
    logo: '🟡',
    description: 'Integrate with Fyers API 3.0'
  }
];

const BrokerIntegrationPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [connections, setConnections] = useState<BrokerStatus[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadConnectionStatus();
      loadSyncHistory();

      // Handle OAuth callback
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      if (code && state) {
        handleOAuthCallback(code, state);
      }
    }
  }, [isAuthenticated, searchParams]);

  const loadConnectionStatus = async () => {
    try {
      setLoading(true);
      const response = await riskCalculatorService.getConnectionStatus();
      if (response.success) {
        setConnections(response.connections || []);
      }
    } catch (err) {
      console.error('Failed to load connection status:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSyncHistory = async () => {
    try {
      const response = await riskCalculatorService.getSyncHistory();
      if (response.success) {
        setSyncHistory(response.history || []);
      }
    } catch (err) {
      console.error('Failed to load sync history:', err);
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      const response = await riskCalculatorService.completeOAuth(code, state);
      if (response.success) {
        alert('Broker connected successfully!');
        loadConnectionStatus();
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err: any) {
      alert('Failed to complete OAuth: ' + err.message);
    }
  };

  const handleConnect = async (broker: string) => {
    try {
      const response = await riskCalculatorService.connectBroker(broker);
      if (response.success && response.auth_url) {
        // Redirect to broker's OAuth page
        window.location.href = response.auth_url;
      }
    } catch (err: any) {
      alert('Failed to initiate connection: ' + err.message);
    }
  };

  const handleDisconnect = async (broker: string) => {
    if (!window.confirm(`Are you sure you want to disconnect ${broker}?`)) return;

    try {
      const response = await riskCalculatorService.disconnectBroker(broker);
      if (response.success) {
        alert('Broker disconnected successfully!');
        loadConnectionStatus();
      }
    } catch (err: any) {
      alert('Failed to disconnect: ' + err.message);
    }
  };

  const handleSyncPositions = async (broker: string) => {
    try {
      setSyncing(broker);
      const response = await riskCalculatorService.syncPositions(broker);
      if (response.success) {
        alert(`Synced ${response.positions_synced} positions!`);
        loadConnectionStatus();
        loadSyncHistory();
      }
    } catch (err: any) {
      alert('Failed to sync positions: ' + err.message);
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncTrades = async (broker: string) => {
    try {
      setSyncing(broker);
      const response = await riskCalculatorService.syncTrades(broker);
      if (response.success) {
        alert(`Synced ${response.trades_synced} trades!`);
        loadConnectionStatus();
        loadSyncHistory();
      }
    } catch (err: any) {
      alert('Failed to sync trades: ' + err.message);
    } finally {
      setSyncing(null);
    }
  };

  const getBrokerConnection = (brokerId: string) => {
    return connections.find((c) => c.broker === brokerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to connect broker accounts
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
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 dark:from-cyan-800 dark:to-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <LinkIcon className="w-12 h-12" />
            <h1 className="text-4xl font-bold">Broker Integration</h1>
          </div>
          <p className="text-xl text-cyan-100">
            Connect your broker account to auto-sync positions and trades
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">
                Secure OAuth Connection
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                We use industry-standard OAuth 2.0 authentication. Your broker credentials are never
                stored on our servers. You can revoke access anytime from your broker's dashboard.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading connections...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Available Brokers */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Available Brokers
              </h2>

              {AVAILABLE_BROKERS.map((broker) => {
                const connection = getBrokerConnection(broker.id);
                const isConnected = connection?.connected || false;

                return (
                  <div
                    key={broker.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{broker.logo}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {broker.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {broker.description}
                          </p>
                          {isConnected && connection && (
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {connection.last_sync && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="w-4 h-4" />
                                  Last sync: {new Date(connection.last_sync).toLocaleString()}
                                </span>
                              )}
                              <span>{connection.positions_count} positions</span>
                              <span>{connection.trades_synced} trades</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      {!isConnected ? (
                        <button
                          onClick={() => handleConnect(broker.id)}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                        >
                          <LinkIcon className="w-5 h-5" />
                          Connect
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleSyncPositions(broker.id)}
                            disabled={syncing === broker.id}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <ArrowPathIcon
                              className={`w-4 h-4 ${syncing === broker.id ? 'animate-spin' : ''}`}
                            />
                            Sync Positions
                          </button>
                          <button
                            onClick={() => handleSyncTrades(broker.id)}
                            disabled={syncing === broker.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <ArrowPathIcon
                              className={`w-4 h-4 ${syncing === broker.id ? 'animate-spin' : ''}`}
                            />
                            Sync Trades
                          </button>
                          <button
                            onClick={() => handleDisconnect(broker.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                          >
                            Disconnect
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sync History Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Sync History
                </h3>

                {syncHistory.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                    No sync history yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {syncHistory.map((sync) => (
                      <div
                        key={sync._id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                            {sync.broker}
                          </span>
                          <span className={`text-xs font-semibold ${getStatusColor(sync.status)}`}>
                            {sync.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {sync.sync_type === 'positions' ? 'Position Sync' : 'Trade Sync'}
                        </p>

                        {sync.status === 'success' && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {sync.records_synced} records synced
                          </p>
                        )}

                        {sync.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {sync.error_message}
                          </p>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(sync.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How does broker integration work?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We use OAuth 2.0 to securely connect to your broker account. You'll be redirected to
                your broker's authorization page where you can grant us read-only access to your
                positions and trade history.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! We never store your broker credentials. We only receive an access token that
                allows us to read your positions and trades. You can revoke this access anytime from
                your broker's dashboard.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What gets synced?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We sync your open positions (holdings and pending orders) and historical trades. This
                data is used to automatically calculate your risk metrics, generate journal entries,
                and provide accurate portfolio analytics.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How often does it sync?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can manually sync anytime. We also provide automatic sync options (coming soon)
                that will sync your data at regular intervals throughout the trading day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerIntegrationPage;
