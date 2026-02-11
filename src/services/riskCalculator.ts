/**
 * Risk Calculator API Service
 * Handles all API calls to the Risk Calculator backend endpoints
 * Supports both Phase 1 (calculation) and Phase 2 (discipline & tracking)
 */

import api from './api';

export interface RiskCalculatorRequest {
  symbol: string;
  trade_type: 'delivery' | 'intraday' | 'fno';
  buy_price: number;
  stop_loss_price: number;
  target_price?: number | null;
  capital_available: number;
  max_risk_per_trade: number;
  max_risk_type: 'percentage' | 'rupees';
  broker: 'zerodha' | 'upstox' | 'custom';
}

// Phase 2 Interfaces
export interface UserSettings {
  max_daily_loss_percent: number;
  max_trades_per_day: number;
  preferred_risk_reward_min: number;
  max_risk_per_trade_percent: number;
  capital_baseline: number;
}

export interface TradeQualityScore {
  score: number;
  max_score: number;
  quality_level: string;
  quality_color: string;
  factors: string[];
  message: string;
  disclaimer: string;
}

export interface DailyExposure {
  trades_count: number;
  max_trades_per_day: number;
  total_risk_amount: number;
  total_risk_percent: number;
  max_daily_loss_percent: number;
  risk_utilization_percent: number;
  realized_pl: number;
  warnings: string[];
  date: string;
}

export interface PreTradeChecklist {
  risk_metrics: {
    risk_per_trade: {
      amount: number;
      percent: number;
      within_limit: boolean;
      message: string;
    };
    stop_loss_impact: {
      amount: number;
      message: string;
    };
    target_impact: {
      amount: number | null;
      message: string;
    };
    daily_exposure: {
      current_percent: number;
      after_trade_percent: number;
      limit_percent: number;
      message: string;
    };
  };
  daily_status: {
    trades_today: number;
    max_trades: number;
    risk_utilization: number;
  };
  warnings: string[];
  disclaimer: string;
}

export interface Phase2Response {
  pre_trade_checklist: PreTradeChecklist;
  trade_quality_score: TradeQualityScore;
  user_settings: {
    max_daily_loss_percent: number;
    max_trades_per_day: number;
    preferred_risk_reward_min: number;
    max_risk_per_trade_percent: number;
  };
}

export interface TradeLog {
  symbol: string;
  trade_type: string;
  entry_price: number;
  stop_loss: number;
  target: number;
  quantity: number;
  risk_amount: number;
  risk_percent: number;
  expected_costs: number;
  status?: string;
  _id?: string;
}

export interface ValidateTradeRequest {
  buy_price: number;
  stop_loss_price: number;
  target_price?: number | null;
  capital_available: number;
  max_risk_per_trade: number;
  max_risk_type: 'percentage' | 'rupees';
}

export interface CostBreakdownRequest {
  trade_type: 'delivery' | 'intraday' | 'fno';
  broker: 'zerodha' | 'upstox' | 'custom';
  buy_price: number;
  sell_price: number;
  quantity: number;
}

export interface Broker {
  broker: string;
  name: string;
  profiles: {
    delivery: {
      brokerage: number;
      brokerage_type: string;
      max_brokerage: number;
    };
    intraday: {
      brokerage: number;
      brokerage_type: string;
      max_brokerage: number;
    };
    fno: {
      brokerage: number;
      brokerage_type: string;
    };
  };
}

export interface RiskCalculatorResponse {
  success: boolean;
  data: {
    symbol: string;
    trade_type: string;
    broker: string;
    inputs: {
      buy_price: number;
      stop_loss_price: number;
      target_price?: number;
      capital_available: number;
      max_risk_per_trade: number;
      max_risk_type: string;
    };
    position_sizing: {
      max_quantity: number;
      position_value: number;
      risk_per_share: number;
      message: string;
    };
    risk_analysis: {
      risk_amount: number;
      risk_percentage: number;
      sl_distance_percentage: number;
      sl_distance_rupees: number;
    };
    risk_reward: {
      has_target: boolean;
      risk: number;
      reward: number;
      ratio: number | string;
      ratio_text: string;
    };
    cost_breakdown: {
      estimated_costs_at_entry: CostDetails;
      costs_at_stop_loss: CostDetails;
      costs_at_target?: CostDetails;
    };
    scenario_analysis: {
      breakeven_price: number;
      at_stop_loss: {
        gross_loss: number;
        net_loss_after_costs: number;
        total_costs: number;
        message: string;
      };
      at_target?: {
        gross_profit: number;
        net_profit_after_costs: number;
        total_costs: number;
        message: string;
      };
    };
    disclaimer: string;
    // Phase 2 data (optional, only when using pre-trade checklist endpoint)
    phase2?: Phase2Response;
  };
  timestamp?: string;
}

export interface CostDetails {
  buy_value: number;
  sell_value: number;
  total_turnover: number;
  brokerage: number;
  brokerage_buy: number;
  brokerage_sell: number;
  stt_ctt: number;
  exchange_txn_charge: number;
  sebi_charges: number;
  stamp_duty: number;
  gst: number;
  total_cost: number;
  cost_percentage: number;
}

export interface ValidationResponse {
  success: boolean;
  validation: {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    quick_estimate?: {
      estimated_quantity: number;
      estimated_position_value: number;
      estimated_risk: number;
    };
  };
}

class RiskCalculatorService {
  /**
   * Calculate position size, risk, and costs
   */
  async calculate(params: RiskCalculatorRequest): Promise<RiskCalculatorResponse> {
    try {
      const response = await api.post('/risk-calculator/calculate', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get list of available brokers
   */
  async getBrokers(): Promise<{ success: boolean; brokers: Broker[] }> {
    try {
      const response = await api.get('/risk-calculator/brokers');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate trade parameters before calculation
   */
  async validateTrade(params: ValidateTradeRequest): Promise<ValidationResponse> {
    try {
      const response = await api.post('/risk-calculator/validate-trade', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed cost breakdown for specific quantity
   */
  async getCostBreakdown(params: CostBreakdownRequest): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/cost-breakdown', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<{ success: boolean; status: string }> {
    try {
      const response = await api.get('/risk-calculator/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 2 METHODS ====================

  /**
   * Get user's risk management settings
   */
  async getUserSettings(): Promise<{ success: boolean; settings: UserSettings }> {
    try {
      const response = await api.get('/risk-calculator/phase2/settings');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user's risk management settings
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; settings: UserSettings; message: string }> {
    try {
      const response = await api.put('/risk-calculator/phase2/settings', settings);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get daily risk exposure
   */
  async getDailyExposure(): Promise<{ success: boolean; exposure: DailyExposure }> {
    try {
      const response = await api.get('/risk-calculator/phase2/daily-exposure');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Calculate trade quality score
   */
  async calculateTradeQuality(risk_reward_ratio: number, risk_per_trade_percent: number): Promise<{ success: boolean; quality: TradeQualityScore }> {
    try {
      const response = await api.post('/risk-calculator/phase2/trade-quality', {
        risk_reward_ratio,
        risk_per_trade_percent
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate pre-trade checklist with Phase 2 analytics
   * This combines Phase 1 calculation with Phase 2 discipline features
   */
  async generatePreTradeChecklist(params: RiskCalculatorRequest): Promise<RiskCalculatorResponse> {
    try {
      const response = await api.post('/risk-calculator/phase2/pre-trade-checklist', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Log a trade for tracking purposes
   */
  async logTrade(trade: TradeLog): Promise<{ success: boolean; trade_log: TradeLog; daily_exposure: DailyExposure; message: string }> {
    try {
      const response = await api.post('/risk-calculator/phase2/log-trade', trade);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all trades logged today
   */
  async getDailyTrades(): Promise<{ success: boolean; trades: TradeLog[]; summary: DailyExposure }> {
    try {
      const response = await api.get('/risk-calculator/phase2/daily-trades');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Check Phase 2 service health
   */
  async phase2HealthCheck(): Promise<{ success: boolean; service: string; status: string; features: string[] }> {
    try {
      const response = await api.get('/risk-calculator/phase2/health');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 3 METHODS ====================

  /**
   * Get session dashboard with today's metrics and behavior insights
   */
  async getSessionDashboard(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase3/session-dashboard');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Close a trade manually
   */
  async closeTrade(tradeId: string, exitPrice: number, exitReason?: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase3/close-trade', {
        trade_id: tradeId,
        exit_price: exitPrice,
        exit_reason: exitReason
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get behavior history and patterns
   */
  async getBehaviorHistory(days?: number): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase3/behavior-history', {
        params: { days }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 4 METHODS ====================

  /**
   * Add a position to portfolio
   */
  async addPosition(position: any): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase4/positions', position);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update position current price
   */
  async updatePositionPrice(positionId: string, currentPrice: number): Promise<any> {
    try {
      const response = await api.put(`/risk-calculator/phase4/positions/${positionId}/price`, {
        current_price: currentPrice
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove a position from portfolio
   */
  async removePosition(positionId: string): Promise<any> {
    try {
      const response = await api.delete(`/risk-calculator/phase4/positions/${positionId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioAnalytics(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase4/portfolio-analytics');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get real-time prices for symbols
   */
  async getRealtimePrices(symbols: string[]): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase4/realtime-prices', { symbols });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get historical returns (3m, 6m, 1y)
   */
  async getHistoricalReturns(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase4/historical-returns');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get portfolio PnL graph data
   */
  async getPortfolioPnLGraph(days?: number): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase4/pnl-graph', {
        params: { days }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get market sentiment and pattern analysis
   */
  async getMarketSentiment(symbols: string[]): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase4/market-sentiment', { symbols });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get 1-year monthly PnL analysis with graph and table data
   */
  async getYearlyMonthlyAnalysis(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase4/yearly-monthly-analysis');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 5 METHODS ====================

  /**
   * Update journal entry for a trade
   */
  async updateJournalEntry(tradeId: string, entry: any): Promise<any> {
    try {
      const response = await api.put(`/risk-calculator/phase5/journal/${tradeId}`, entry);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get journal entries with optional filters
   */
  async getJournalEntries(filters?: any): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase5/journal', { params: filters });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate AI insights from journal
   */
  async generateInsights(): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase5/journal/insights');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get cached insights
   */
  async getCachedInsights(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase5/journal/insights');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Export journal as CSV
   */
  async exportJournalCSV(filters?: any): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase5/journal/export', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 6 METHODS ====================

  /**
   * Simulate costs for multiple scenarios
   */
  async simulateCosts(params: any): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase6/simulate-costs', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Simulate risk scenarios
   */
  async simulateRisk(params: any): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase6/simulate-risk', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Simulate drawdown scenarios
   */
  async simulateDrawdown(params: any): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase6/simulate-drawdown', params);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get simulation history
   */
  async getSimulations(type?: string): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase6/simulations', {
        params: { type }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 7 METHODS ====================

  /**
   * Get equity curve data
   */
  async getEquityCurve(period?: string): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase7/equity-curve', {
        params: { period }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get drawdown analysis
   */
  async getDrawdownAnalysis(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase7/drawdown-analysis');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get volatility metrics
   */
  async getVolatilityMetrics(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase7/volatility-metrics');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get rolling metrics (win rate, profit factor, etc.)
   */
  async getRollingMetrics(window?: number): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase7/rolling-metrics', {
        params: { window }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Stress test portfolio
   */
  async stressTestPortfolio(scenarios?: any): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase7/stress-test', scenarios);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get comprehensive analytics dashboard
   */
  async getComprehensiveAnalytics(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase7/comprehensive-analytics');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 8 METHODS ====================

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase8/notification-preferences');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences: any): Promise<any> {
    try {
      const response = await api.put('/risk-calculator/phase8/notification-preferences', preferences);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate performance report
   */
  async generateReport(reportType: string, period?: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase8/generate-report', {
        report_type: reportType,
        period
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report history
   */
  async getReports(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase8/reports');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase8/test-email');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== PHASE 9 METHODS ====================

  /**
   * Connect broker account
   */
  async connectBroker(broker: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase9/broker/connect', { broker });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Complete OAuth flow
   */
  async completeOAuth(code: string, state: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase9/broker/oauth-callback', {
        code,
        state
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Disconnect broker
   */
  async disconnectBroker(broker: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase9/broker/disconnect', { broker });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync positions from broker
   */
  async syncPositions(broker: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase9/broker/sync-positions', { broker });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync trades from broker
   */
  async syncTrades(broker: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const response = await api.post('/risk-calculator/phase9/broker/sync-trades', {
        broker,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get broker connection status
   */
  async getConnectionStatus(): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase9/broker/status');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(broker?: string): Promise<any> {
    try {
      const response = await api.get('/risk-calculator/phase9/broker/sync-history', {
        params: { broker }
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const riskCalculatorService = new RiskCalculatorService();
