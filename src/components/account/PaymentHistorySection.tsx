import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Transaction {
  transaction_id: string;
  order_id: string;
  plan: string;
  plan_display_name: string;
  duration: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionDetails extends Transaction {
  gateway: string;
  payment_session_id?: string;
  gateway_payment_id?: string;
  payment_status?: string;
  bank_reference?: string;
  payment_time?: string;
}

const PaymentHistorySection: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      const response = await subscriptionService.getPaymentHistory();
      if (response.success) {
        setPaymentHistory(response.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactionDetails = async (transactionId: string) => {
    try {
      setLoadingDetails(true);
      const response = await subscriptionService.getTransactionDetails(transactionId);
      if (response.success) {
        setSelectedTransaction(response.transaction);
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'PENDING':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'FAILED':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Payment History</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">View your transaction history and receipts</p>

      <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="text-center py-12 px-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Your completed transactions will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paymentHistory.map((tx) => (
                  <tr key={tx.transaction_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(tx.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{tx.plan_display_name}</div>
                      {tx.duration && (
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{tx.duration}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {tx.currency === 'INR' ? '\u20B9' : tx.currency}{tx.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => fetchTransactionDetails(tx.transaction_id)}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {loadingDetails ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Transaction ID" value={selectedTransaction.transaction_id} />
                  <DetailItem label="Order ID" value={selectedTransaction.order_id} />
                  <DetailItem label="Plan" value={`${selectedTransaction.plan_display_name} (${selectedTransaction.duration})`} />
                  <DetailItem label="Amount" value={`${selectedTransaction.currency} ${selectedTransaction.amount}`} />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <DetailItem label="Gateway" value={selectedTransaction.gateway} />
                  <DetailItem label="Payment Method" value={selectedTransaction.payment_method || 'N/A'} />
                  <DetailItem label="Date" value={formatDate(selectedTransaction.created_at)} />
                  {selectedTransaction.bank_reference && (
                    <div className="col-span-2">
                      <DetailItem label="Bank Reference" value={selectedTransaction.bank_reference} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
    <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{value}</p>
  </div>
);

export default PaymentHistorySection;
