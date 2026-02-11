import api from './api';

export interface ClassicalPattern {
  name: string;
  confidence: number;
  pattern_type: string;
  completion_percent: number;
}

export interface PriceActionAnalysis {
  score: number;
  trend: string;
  trend_strength: string;
  support_levels: number[];
  resistance_levels: number[];
  breakout_signal: boolean;
  breakout_type?: string;
  volume_confirmation: boolean;
}

export interface CandlestickPattern {
  name: string;
  type: string;
  reliability: number;
  candles_involved: number;
}

export interface CombinedAnalysis {
  score: number;
  signal: string;
  confidence: string;
  insights: string[];
  model_agreement: number;
}

export interface PatternAnalysisResult {
  symbol: string;
  classical_patterns: {
    score: number;
    detected_patterns: ClassicalPattern[];
    suggested_stop_loss: number;
    suggested_target: number;
  };
  price_action: PriceActionAnalysis;
  candlestick_patterns: {
    score: number;
    detected_patterns: CandlestickPattern[];
  };
  combined_analysis: CombinedAnalysis;
  analysis_id: string;
}

export interface AISuggestions {
  stop_loss: number;
  stop_loss_reason: string;
  targets: Array<{
    level: string;
    price: number;
    rr_ratio: number;
  }>;
}

export interface PositionCalculation {
  quantity: number;
  total_investment: number;
  risk_amount: number;
  position_percent: number;
  breakeven_price: number;
}

class PatternAnalysisService {
  /**
   * Run 3-model AI pattern analysis on a stock
   */
  async analyzePatterns(
    symbol: string,
    timeframe: string = '1d',
    lookbackDays: number = 90
  ): Promise<PatternAnalysisResult> {
    try {
      const response = await api.post('/pattern-analysis/analyze', {
        symbol,
        timeframe,
        lookback_days: lookbackDays
      });
      return response.data.analysis;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to analyze patterns');
    }
  }

  /**
   * Get AI-suggested stop loss and targets
   */
  async getAISuggestions(
    symbol: string,
    entryPrice: number,
    analysisId: string
  ): Promise<AISuggestions> {
    try {
      const response = await api.post('/risk-calculator/ai-suggestions', {
        symbol,
        entry_price: entryPrice,
        analysis_id: analysisId
      });
      return response.data.suggestions;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get AI suggestions');
    }
  }

  /**
   * Calculate optimal position size
   */
  async calculatePosition(
    portfolioValue: number,
    riskPercent: number,
    entryPrice: number,
    stopLoss: number
  ): Promise<PositionCalculation> {
    try {
      const response = await api.post('/risk-calculator/calculate-position', {
        portfolio_value: portfolioValue,
        risk_percent: riskPercent,
        entry_price: entryPrice,
        stop_loss: stopLoss
      });
      return response.data.position;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to calculate position');
    }
  }

  /**
   * Get historical pattern analysis for a symbol
   */
  async getPatternHistory(symbol: string, days: number = 30): Promise<PatternAnalysisResult[]> {
    try {
      const response = await api.get(`/pattern-analysis/history/${symbol}`, {
        params: { days }
      });
      return response.data.analyses;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get pattern history');
    }
  }
}

export const patternAnalysisService = new PatternAnalysisService();
