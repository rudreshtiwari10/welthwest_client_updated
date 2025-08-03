# Backtest (Beta) Feature Guide

## Overview

The new **Backtest (Beta)** feature is a comprehensive backtesting interface that integrates with the enhanced `/api/backtesting/newrun` endpoint. This feature provides advanced analytics, interactive visualizations, and a user-friendly interface for testing trading strategies.

## Key Features

### 🎯 **Enhanced User Experience**
- **Tabbed Interface**: Organized into Parameters, Results, and Charts tabs
- **Real-time Validation**: Form validation with immediate feedback
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Consistent with the application theme

### 📊 **Advanced Analytics**
- **Comprehensive Metrics**: 16+ performance metrics including Sharpe, Sortino, and Calmar ratios
- **Monte Carlo Analysis**: Risk assessment with confidence intervals and VaR calculations
- **Trade Analysis**: Detailed trade history with P&L tracking
- **Risk Management**: Built-in drawdown protection and position sizing

### 📈 **Interactive Visualizations**
- **Candlestick Charts**: Price action with buy/sell signals and technical indicators
- **Equity Curve**: Portfolio performance visualization over time
- **Drawdown Chart**: Risk visualization and recovery analysis
- **Plotly Integration**: Interactive, zoomable charts with professional styling

### 🔧 **Technical Indicators**
Support for 11 technical indicators with customizable parameters:
- **RSI** (Relative Strength Index)
- **MACD** (Moving Average Convergence Divergence)
- **Bollinger Bands**
- **Stochastic Oscillator**
- **SMA/EMA** (Moving Averages)
- **ADX** (Average Directional Index)
- **Williams %R**
- **CCI** (Commodity Channel Index)
- **ATR** (Average True Range)
- **OBV** (On Balance Volume)

## How to Use

### 1. **Access the Feature**
- Navigate to the sidebar
- Under "Trading Tools", click **"Backtest (Beta)"**
- The feature requires authentication and active subscription

### 2. **Configure Parameters**
#### Basic Parameters:
- **Stock Symbol**: Select from popular Indian stocks
- **Period**: Choose data period (1 month to 5 years)
- **Timeframe**: Select interval (15 minutes to 1 day)
- **Initial Capital**: Set starting investment amount
- **Position Size**: Percentage of capital per trade
- **Voting Threshold**: Minimum agreement between indicators

#### Technical Indicators:
- **Select Indicators**: Choose which indicators to use
- **Configure Parameters**: Customize periods and thresholds
- **Voting System**: Indicators vote on buy/sell signals

#### Advanced Settings:
- **Risk-Reward Ratio**: Set profit target multiplier
- **Max Drawdown**: Maximum acceptable loss percentage
- **Monte Carlo Simulations**: Number of simulations for risk analysis

### 3. **Run Backtest**
- Click **"Run Backtest"** button
- Wait for processing (typically 10-30 seconds)
- Automatically switches to Results tab upon completion

### 4. **Analyze Results**
#### Summary Cards:
- **Total Return**: Absolute and percentage returns
- **Win Rate**: Percentage of profitable trades
- **Sharpe Ratio**: Risk-adjusted return metric
- **Max Drawdown**: Worst portfolio decline

#### Detailed Metrics:
- **Return Metrics**: Total return, average trade, profit factor
- **Risk Metrics**: Sharpe, Sortino, Calmar ratios
- **Trade Statistics**: Win rate, best/worst trades

#### Trade History:
- **Complete Trade List**: Entry/exit dates, prices, P&L
- **Trade Direction**: Long/short position indicators
- **Exit Reasons**: Stop loss, take profit, signal exit

#### Monte Carlo Analysis:
- **Expected Returns**: Mean and standard deviation
- **Risk Metrics**: VaR (Value at Risk) calculations
- **Confidence Intervals**: 95% confidence bounds
- **Loss Probability**: Chance of losing money

### 5. **Review Charts**
#### Interactive Visualizations:
- **Price Chart**: Candlesticks with technical indicators
- **Buy/Sell Signals**: Visual markers on price chart
- **Equity Curve**: Portfolio value over time
- **Drawdown Chart**: Risk periods and recovery

## Technical Implementation

### Frontend Components
```
BacktestingBetaPage.tsx
├── Parameter Configuration Form
├── Results Display Components
├── Interactive Chart Components
└── Responsive Layout System
```

### API Integration
- **Endpoint**: `/api/backtesting/newrun`
- **Method**: POST with comprehensive parameters
- **Response**: Complete backtest results with charts
- **Error Handling**: Graceful error display and recovery

### Data Flow
1. **User Input** → Parameter validation
2. **API Call** → Backend processing
3. **Results** → Data transformation
4. **Charts** → Plotly visualization
5. **Display** → Formatted results

## Key Differences from Standard Backtesting

| Feature | Standard Backtest | Backtest (Beta) |
|---------|------------------|------------------|
| **Interface** | Basic form | Tabbed, modern UI |
| **Indicators** | Limited selection | 11 indicators with customization |
| **Visualizations** | Basic charts | Interactive Plotly charts |
| **Analytics** | Basic metrics | 16+ comprehensive metrics |
| **Risk Analysis** | Limited | Monte Carlo simulations |
| **User Experience** | Functional | Professional, intuitive |

## Performance Considerations

### Optimization Features:
- **Lazy Loading**: Charts load only when needed
- **Data Caching**: Results cached for quick access
- **Progressive Enhancement**: Core functionality first
- **Error Boundaries**: Graceful failure handling

### Recommended Usage:
- **Period Length**: 1-2 years for optimal performance
- **Timeframe**: 1 day for comprehensive analysis
- **Indicators**: 3-6 indicators for balanced signals
- **Monte Carlo**: 1000 simulations for reliable statistics

## Troubleshooting

### Common Issues:

#### 1. **Loading Errors**
- **Cause**: Network connectivity or server issues
- **Solution**: Check connection, retry request
- **Prevention**: Ensure stable internet connection

#### 2. **No Data Available**
- **Cause**: Invalid stock symbol or date range
- **Solution**: Select different symbol or period
- **Prevention**: Use suggested stock symbols

#### 3. **Chart Display Issues**
- **Cause**: Browser compatibility or JavaScript errors
- **Solution**: Refresh page, try different browser
- **Prevention**: Use modern browsers (Chrome, Firefox, Safari)

#### 4. **Performance Issues**
- **Cause**: Large datasets or complex calculations
- **Solution**: Reduce period length or indicator count
- **Prevention**: Start with shorter periods

### Getting Help:
- **Documentation**: Refer to API documentation
- **Support**: Contact technical support team
- **Community**: Check user community forums

## Future Enhancements

### Planned Features:
- **Strategy Templates**: Pre-configured indicator sets
- **Backtesting Comparison**: Side-by-side strategy analysis
- **Alert Integration**: Real-time signal notifications
- **Portfolio Backtesting**: Multi-asset strategies
- **Advanced Exports**: PDF reports and Excel downloads

### Beta Feedback:
We welcome feedback on the beta features:
- **Performance**: Speed and reliability
- **Usability**: Interface and workflow
- **Features**: Missing functionality or improvements
- **Bugs**: Any issues or unexpected behavior

---

*This feature is currently in beta and may receive updates based on user feedback and performance optimization.*