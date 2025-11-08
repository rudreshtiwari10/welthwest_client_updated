/**
 * Payment Service - Cashfree Integration
 * Handles all payment-related API calls including order creation, verification, and status checks
 */

import axios from 'axios';
import { API_URL } from './api';

// Create axios instance for payment service
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateOrderRequest {
  plan: string; // PRO, STARTER, ADVANCED, ENTERPRISE
  duration: string; // weekly, monthly, annual
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  transaction_id: string;
  payment_session_id: string;
  payment_link: string;
  amount: number;
  currency: string;
  plan: string;
  duration: string;
  error?: string;
}

export interface OrderStatusResponse {
  success: boolean;
  order: {
    order_id: string;
    status: string;
    plan: string;
    duration: string;
    amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}

export interface Transaction {
  transaction_id: string;
  order_id: string;
  plan: string;
  duration: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionHistoryResponse {
  success: boolean;
  transactions: Transaction[];
  error?: string;
}

class PaymentService {
  /**
   * Create a new payment order with Cashfree
   * @param planData - Plan and duration information
   * @returns Order details with payment link
   */
  async createOrder(planData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const response = await api.post('/payment/create-order', planData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to create payment order'
      );
    }
  }

  /**
   * Get order status by order ID
   * @param orderId - Cashfree order identifier
   * @returns Order status and details
   */
  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    try {
      const response = await api.get(`/payment/order-status/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting order status:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to get order status'
      );
    }
  }

  /**
   * Get transaction history for the authenticated user
   * @returns List of transactions
   */
  async getTransactionHistory(): Promise<TransactionHistoryResponse> {
    try {
      const response = await api.get('/payment/transaction-history');
      return response.data;
    } catch (error: any) {
      console.error('Error getting transaction history:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to get transaction history'
      );
    }
  }

  /**
   * Handle Cashfree payment redirect
   * Initiates payment by redirecting to Cashfree checkout
   * @param paymentLink - Cashfree payment link
   */
  redirectToPayment(paymentLink: string): void {
    if (!paymentLink || paymentLink === 'null' || paymentLink === 'undefined') {
      console.error('Invalid payment link:', paymentLink);
      throw new Error('Payment gateway is not configured properly. Please contact support or use manual credit option.');
    }
    window.location.href = paymentLink;
  }

  /**
   * Load Cashfree checkout SDK (for embedded checkout if needed)
   * @param sessionId - Payment session ID from order creation
   * @param orderId - Order ID for redirect URL
   * @param onSuccess - Callback for successful payment
   * @param onFailure - Callback for failed payment
   */
  async loadCashfreeCheckout(
    sessionId: string,
    orderId: string,
    onSuccess: (data: any) => void,
    onFailure: (error: any) => void
  ): Promise<void> {
    // Load Cashfree SDK script dynamically
    if (!(window as any).Cashfree) {
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    // Initialize Cashfree checkout
    const cashfree = (window as any).Cashfree({
      mode: process.env.REACT_APP_CASHFREE_ENV || 'sandbox', // 'sandbox' or 'production'
    });

    // Open checkout with order_id in return URL
    cashfree.checkout({
      paymentSessionId: sessionId,
      returnUrl: `${window.location.origin}/payment-success?order_id=${orderId}`,
      onSuccess: onSuccess,
      onFailure: onFailure,
    });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
