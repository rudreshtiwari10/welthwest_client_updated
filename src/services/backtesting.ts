import { API_URL } from './api';

export interface BacktestIndicator {
  type: string;
  parameters: Record<string, number>;
  conditions?: Record<string, number>;
}

export interface BacktestRequest {
  ticker: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  position_size: number;
  stop_loss?: number;
  take_profit?: number;
  timeframe?: string;
  indicators: BacktestIndicator[];
  // Risk Management Parameters
  max_drawdown?: number;
  max_positions?: number;
  sector_exposure_limit?: number;
  consecutive_loss_limit?: number;
  daily_loss_limit?: number;
  weekly_loss_limit?: number;
  // Portfolio Constraints
  max_allocation?: number;
  margin_requirement?: number;
  margin_interest?: number;
  min_cash_reserve?: number;
  // Position Sizing Method
  position_sizing_method?: 'fixed' | 'kelly';
  kelly_fraction?: number;
  // Correlation Settings
  correlation_threshold?: number;
  benchmark_symbol?: string;
}

export interface Trade {
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  size: number;
  pnl: number;
  pnl_pct: number;
}

export interface DailyPnLStats {
  mean: number;
  std: number;
  worst: number;
  best: number;
}

export interface PerformanceMetrics {
  total_return: number;
  annualized_return: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  omega_ratio: number;
  max_drawdown: number;
  win_rate: number;
  profit_factor: number;
  ulcer_index: number;
  time_in_market: number;
  avg_trade_duration: number;
  avg_mae: number;
  avg_mfe: number;
  longest_win_streak: number;
  longest_lose_streak: number;
  benchmark_correlation: number;
  benchmark_beta: number;
  benchmark_alpha: number;
  daily_pnl_stats: DailyPnLStats;
  weekly_pnl_stats: DailyPnLStats;
}

export interface MonteCarloResults {
  percentiles: {
    final_capital: Record<string, number>;
    max_drawdown: Record<string, number>;
    sharpe_ratio: Record<string, number>;
  };
  metrics: {
    final_capital: Record<string, number>;
    max_drawdown: Record<string, number>;
    sharpe_ratio: Record<string, number>;
  };
  confidence_intervals: {
    final_capital: Record<string, number>;
    max_drawdown: Record<string, number>;
    sharpe_ratio: Record<string, number>;
  };
}

export interface BacktestResponse {
  trades: Trade[];
  metrics: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    total_pnl: number;
    max_drawdown: number;
    max_consecutive_losses: number;
    current_consecutive_losses: number;
    daily_pnl: Record<string, number>;
    weekly_pnl: Record<string, number>;
    margin_used: number;
    margin_interest_paid: number;
  };
  indicator_data: Record<string, number[]>;
  price_data: Array<{
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
  }>;
  summary: string;
  monte_carlo?: MonteCarloResults;
}

class BacktestingService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async runBacktest(params: BacktestRequest): Promise<BacktestResponse> {
    try {
      // Validate inputs before sending
      this.validateBacktestParams(params);

      // Clean the params to ensure JSON serialization works
      const cleanedParams = this.cleanParamsForJSON(params);

      const response = await fetch(`${API_URL}/backtesting/run`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(cleanedParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run backtest');
      }

      const data = await response.json();
      return data as BacktestResponse;
    } catch (error) {
      console.error('Backtest error:', error);
      throw error;
    }
  }

  private cleanParamsForJSON(params: BacktestRequest): BacktestRequest {
    // Helper function to clean numeric values
    const cleanNumber = (value: any): number | undefined => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = Number(value);
      if (isNaN(num) || !isFinite(num)) return undefined;
      return num;
    };

    // Clean all numeric fields
    const cleaned: BacktestRequest = {
      ...params,
      initial_capital: cleanNumber(params.initial_capital) || 10000,
      position_size: cleanNumber(params.position_size) || 10,
      stop_loss: cleanNumber(params.stop_loss),
      take_profit: cleanNumber(params.take_profit),
      max_drawdown: cleanNumber(params.max_drawdown),
      max_positions: cleanNumber(params.max_positions),
      sector_exposure_limit: cleanNumber(params.sector_exposure_limit),
      consecutive_loss_limit: cleanNumber(params.consecutive_loss_limit),
      daily_loss_limit: cleanNumber(params.daily_loss_limit),
      weekly_loss_limit: cleanNumber(params.weekly_loss_limit),
      max_allocation: cleanNumber(params.max_allocation),
      margin_requirement: cleanNumber(params.margin_requirement),
      margin_interest: cleanNumber(params.margin_interest),
      min_cash_reserve: cleanNumber(params.min_cash_reserve),
      kelly_fraction: cleanNumber(params.kelly_fraction),
      correlation_threshold: cleanNumber(params.correlation_threshold),
      // Clean indicator parameters
      indicators: params.indicators.map(indicator => ({
        ...indicator,
        parameters: Object.fromEntries(
          Object.entries(indicator.parameters).map(([key, value]) => [
            key,
            cleanNumber(value) || 0
          ])
        ),
        conditions: indicator.conditions ? Object.fromEntries(
          Object.entries(indicator.conditions).map(([key, value]) => [
            key,
            cleanNumber(value) || 0
          ])
        ) : undefined
      }))
    };

    return cleaned;
  }

  private validateBacktestParams(params: BacktestRequest): void {
    // Required fields
    if (!params.ticker) throw new Error('Ticker is required');
    if (!params.start_date) throw new Error('Start date is required');
    if (!params.end_date) throw new Error('End date is required');
    if (!params.initial_capital) throw new Error('Initial capital is required');
    if (!params.position_size) throw new Error('Position size is required');
    if (!params.indicators || params.indicators.length === 0) {
      throw new Error('At least one indicator is required');
    }

    // Date validation
    const start = new Date(params.start_date);
    const end = new Date(params.end_date);
    const now = new Date();
    
    // Set now to the end of the current day for comparison
    now.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime())) throw new Error('Invalid start date');
    if (isNaN(end.getTime())) throw new Error('Invalid end date');
    if (start >= end) throw new Error('Start date must be before end date');
    if (end > now) throw new Error('End date cannot be later than today');

    // Position size validation (should be a percentage between 0.1 and 100)
    if (params.position_size <= 0) {
      throw new Error('Position size must be greater than 0%');
    }
    
    if (params.position_size > 100) {
      throw new Error('Position size cannot exceed 100% of capital');
    }

    // Initial capital validation
    if (params.initial_capital <= 0) {
      throw new Error('Initial capital must be greater than 0');
    }

    // Optional parameters validation
    if (params.stop_loss !== undefined && (params.stop_loss <= 0 || params.stop_loss >= 100)) {
      throw new Error('Stop loss must be between 0 and 100');
    }
    if (params.take_profit !== undefined && (params.take_profit <= 0 || params.take_profit >= 100)) {
      throw new Error('Take profit must be between 0 and 100');
    }
    if (params.max_drawdown !== undefined && (params.max_drawdown <= 0 || params.max_drawdown >= 100)) {
      throw new Error('Max drawdown must be between 0 and 100');
    }
    if (params.max_positions !== undefined && params.max_positions <= 0) {
      throw new Error('Max positions must be greater than 0');
    }
    if (params.kelly_fraction !== undefined && (params.kelly_fraction <= 0 || params.kelly_fraction > 1)) {
      throw new Error('Kelly fraction must be between 0 and 1');
    }

    // Timeframe validation
    const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo'];
    if (params.timeframe && !validTimeframes.includes(params.timeframe)) {
      throw new Error(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`);
    }

    // Indicator validation
    params.indicators.forEach((indicator, index) => {
      if (!indicator.type) {
        throw new Error(`Indicator at index ${index} must have a type`);
      }
      if (!indicator.parameters || Object.keys(indicator.parameters).length === 0) {
        throw new Error(`Indicator ${indicator.type} must have parameters`);
      }
    });
  }

  // Helper method to format dates for the API
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper method to get available indicators
  getAvailableIndicators(): { type: string; defaultParams: Record<string, number>; description: string }[] {
    return [
      {
        type: 'RSI',
        defaultParams: { period: 14 },
        description: 'Relative Strength Index - Momentum indicator that measures the speed and magnitude of recent price changes'
      },
      {
        type: 'MACD',
        defaultParams: { 
          fastperiod: 12,
          slowperiod: 26,
          signalperiod: 9
        },
        description: 'Moving Average Convergence Divergence - Trend-following momentum indicator'
      },
      {
        type: 'Bollinger',
        defaultParams: { 
          period: 20,
          num_std: 2
        },
        description: 'Bollinger Bands - Shows price volatility and potential overbought/oversold conditions'
      },
      {
        type: 'SMA',
        defaultParams: { period: 20 },
        description: 'Simple Moving Average - Shows average price over a specific period'
      },
      {
        type: 'EMA',
        defaultParams: { period: 20 },
        description: 'Exponential Moving Average - Weighted moving average that gives more importance to recent prices'
      },
      {
        type: 'Stochastic',
        defaultParams: {
          k_period: 14,
          d_period: 3
        },
        description: 'Stochastic Oscillator - Momentum indicator comparing closing price to price range over time'
      },
      {
        type: 'ATR',
        defaultParams: { period: 14 },
        description: 'Average True Range - Measures market volatility'
      },
      {
        type: 'OBV',
        defaultParams: {},
        description: 'On-Balance Volume - Measures buying and selling pressure using volume'
      },
      {
        type: 'VWAP',
        defaultParams: {},
        description: 'Volume Weighted Average Price - Average price weighted by volume'
      }
    ];
  }
}

export const backtestingService = new BacktestingService();