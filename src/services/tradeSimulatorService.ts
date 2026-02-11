import api from './api';

export interface TradeTarget {
  level: number;
  price: number;
  percent_gain: number;
  quantity_to_exit: number;
  hit: boolean;
  hit_date?: string;
}

export interface TradeLogEntry {
  timestamp: string;
  action: string;
  details: any;
  price_at_action: number;
}

export interface SimulatedTrade {
  trade_id: string;
  user_id: string;
  symbol: string;
  company_name: string;
  exchange: string;
  entry_date: string;
  entry_price: number;
  quantity: number;
  total_investment: number;
  entry_type: string;
  stop_loss: number;
  stop_loss_percent: number;
  targets: TradeTarget[];
  trailing_stop: boolean;
  trailing_stop_percent: number;
  portfolio_value_at_entry: number;
  risk_percent: number;
  risk_amount: number;
  position_size_percent: number;
  risk_reward_ratio: number;
  expected_value: number;
  breakeven_price: number;
  pattern_analysis_id?: string;
  ai_confidence_score: number;
  primary_pattern: string;
  signal_type: string;
  tags: string[];
  strategy: string;
  notes: string;
  status: 'OPEN' | 'CLOSED' | 'STOPPED_OUT' | 'TARGET_HIT';
  current_price: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  days_in_trade: number;
  exit_date?: string;
  exit_price?: number;
  exit_type?: string;
  realized_pnl?: number;
  realized_pnl_percent?: number;
  actual_risk_reward?: number;
  pattern_outcome?: string;
  pattern_accuracy?: boolean;
  trade_log: TradeLogEntry[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface LogTradeRequest {
  symbol: string;
  entry_price: number;
  quantity: number;
  stop_loss: number;
  targets: number[];
  portfolio_value: number;
  risk_percent: number;
  pattern_analysis_id?: string;
  notes?: string;
  tags?: string[];
  strategy?: string;
}

export interface PortfolioSnapshot {
  total_value: number;
  total_invested: number;
  cash_balance: number;
  unrealized_pnl: number;
  realized_pnl: number;
  total_pnl: number;
  open_positions: any[];
  total_risk_exposure: number;
  total_risk_percent: number;
}

export interface PerformanceAnalytics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  total_pnl: number;
  total_gains: number;
  total_losses: number;
  average_win: number;
  average_loss: number;
  best_trade: {
    symbol: string;
    pnl: number;
    date: string;
  };
  worst_trade: {
    symbol: string;
    pnl: number;
    date: string;
  };
  equity_curve: Array<{
    date: string;
    pnl: number;
  }>;
  pattern_performance: {
    [pattern: string]: {
      total: number;
      wins: number;
      losses: number;
      total_pnl: number;
      win_rate: number;
    };
  };
}

class TradeSimulatorService {
  /**
   * Log a new simulated trade
   */
  async logTrade(tradeData: LogTradeRequest): Promise<{ success: boolean; trade: SimulatedTrade; trade_id: string }> {
    try {
      const response = await api.post('/trade-simulator/log-trade', tradeData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to log trade');
    }
  }

  /**
   * Get all active positions
   */
  async getActivePositions(): Promise<SimulatedTrade[]> {
    try {
      const response = await api.get('/trade-simulator/active-positions');
      return response.data.positions;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get active positions');
    }
  }

  /**
   * Update trade parameters
   */
  async updateTrade(
    tradeId: string,
    updates: {
      stop_loss?: number;
      targets?: number[];
      trailing_stop?: boolean;
      trailing_stop_percent?: number;
    }
  ): Promise<{ success: boolean }> {
    try {
      const response = await api.put(`/trade-simulator/update-trade/${tradeId}`, updates);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update trade');
    }
  }

  /**
   * Close a position
   */
  async closePosition(
    tradeId: string,
    exitPrice: number,
    exitType: string = 'MANUAL',
    notes?: string
  ): Promise<{ success: boolean; realized_pnl: number; realized_pnl_percent: number }> {
    try {
      const response = await api.post('/trade-simulator/close-position', {
        trade_id: tradeId,
        exit_price: exitPrice,
        exit_type: exitType,
        notes
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to close position');
    }
  }

  /**
   * Get trade journal with filters
   */
  async getTradeJournal(filters?: {
    status?: string;
    symbol?: string;
    pattern?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<SimulatedTrade[]> {
    try {
      const response = await api.get('/trade-simulator/trade-journal', {
        params: filters
      });
      return response.data.trades;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get trade journal');
    }
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(): Promise<PerformanceAnalytics> {
    try {
      const response = await api.get('/trade-simulator/performance-analytics');
      return response.data.analytics;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get performance analytics');
    }
  }

  /**
   * Get portfolio snapshot
   */
  async getPortfolioSnapshot(): Promise<PortfolioSnapshot> {
    try {
      const response = await api.get('/trade-simulator/portfolio-snapshot');
      return response.data.snapshot;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get portfolio snapshot');
    }
  }
}

export const tradeSimulatorService = new TradeSimulatorService();
