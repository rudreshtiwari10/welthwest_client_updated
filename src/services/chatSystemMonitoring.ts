// Chat System Monitoring Service - Performance tracking and A/B testing
// Part of Phase 3: Safe Transition implementation

interface PerformanceMetric {
  timestamp: number;
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  system: 'old' | 'new';
  sessionId?: string;
}

interface UsageMetric {
  timestamp: number;
  action: string;
  system: 'old' | 'new';
  userId?: string;
  sessionId?: string;
  metadata?: any;
}

interface ErrorMetric {
  timestamp: number;
  error: string;
  system: 'old' | 'new';
  operation: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
}

interface SystemHealth {
  system: 'old' | 'new';
  status: 'healthy' | 'warning' | 'error';
  metrics: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    totalRequests: number;
    recentErrors: ErrorMetric[];
  };
  lastUpdated: number;
}

class ChatSystemMonitoring {
  private performanceMetrics: PerformanceMetric[] = [];
  private usageMetrics: UsageMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  private abTestGroup: 'A' | 'B' | 'control' = 'control';

  constructor() {
    this.loadStoredMetrics();
    this.determineABTestGroup();
    this.startPeriodicCleanup();
  }

  // A/B Testing Logic
  private determineABTestGroup(): void {
    let group = localStorage.getItem('abTestGroup') as 'A' | 'B' | 'control';
    
    if (!group) {
      // Assign user to A/B test group based on user ID hash or random
      const userId = localStorage.getItem('userId') || 'anonymous';
      const hash = this.simpleHash(userId);
      
      // 40% A, 40% B, 20% control
      if (hash % 100 < 40) {
        group = 'A';
      } else if (hash % 100 < 80) {
        group = 'B';
      } else {
        group = 'control';
      }
      
      localStorage.setItem('abTestGroup', group);
    }
    
    this.abTestGroup = group;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get user's A/B test group
  getABTestGroup(): 'A' | 'B' | 'control' {
    return this.abTestGroup;
  }

  // Determine which system to use based on A/B test and user preference
  determineSystemToUse(userPreference?: 'old' | 'new' | 'auto'): 'old' | 'new' {
    // User explicit preference overrides A/B test
    if (userPreference === 'old') return 'old';
    if (userPreference === 'new') return 'new';
    
    // Auto or no preference - use A/B test logic
    const oldSystemHealth = this.getSystemHealth('old');
    const newSystemHealth = this.getSystemHealth('new');
    
    // If new system has critical errors, fall back to old system
    if (newSystemHealth.status === 'error') return 'old';
    
    // A/B test logic
    switch (this.abTestGroup) {
      case 'A':
        return 'new'; // Group A gets new system
      case 'B':
        return 'old'; // Group B gets old system
      case 'control':
        // Control group gets automatic selection based on performance
        return newSystemHealth.metrics.successRate > oldSystemHealth.metrics.successRate ? 'new' : 'old';
      default:
        return 'old';
    }
  }

  // Track performance metrics
  trackPerformance(operation: string, system: 'old' | 'new', startTime: number, success: boolean, error?: string, sessionId?: string): void {
    const metric: PerformanceMetric = {
      timestamp: Date.now(),
      operation,
      duration: Date.now() - startTime,
      success,
      error,
      system,
      sessionId
    };

    this.performanceMetrics.push(metric);
    this.trimMetrics(this.performanceMetrics);
    this.saveMetricsToStorage();

    // Also track as usage metric
    this.trackUsage(`performance_${operation}`, system, undefined, sessionId, {
      duration: metric.duration,
      success: metric.success
    });
  }

  // Track usage metrics
  trackUsage(action: string, system: 'old' | 'new', userId?: string, sessionId?: string, metadata?: any): void {
    const metric: UsageMetric = {
      timestamp: Date.now(),
      action,
      system,
      userId,
      sessionId,
      metadata
    };

    this.usageMetrics.push(metric);
    this.trimMetrics(this.usageMetrics);
    this.saveMetricsToStorage();
  }

  // Track errors
  trackError(error: string, system: 'old' | 'new', operation: string, stack?: string, userId?: string, sessionId?: string): void {
    const metric: ErrorMetric = {
      timestamp: Date.now(),
      error,
      system,
      operation,
      stack,
      userId,
      sessionId
    };

    this.errorMetrics.push(metric);
    this.trimMetrics(this.errorMetrics);
    this.saveMetricsToStorage();

    console.error(`Chat System Error [${system}]:`, error, { operation, stack, userId, sessionId });
  }

  // Get system health status
  getSystemHealth(system: 'old' | 'new'): SystemHealth {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Get metrics from last hour
    const recentPerformance = this.performanceMetrics.filter(
      m => m.system === system && m.timestamp > oneHourAgo
    );
    const recentErrors = this.errorMetrics.filter(
      m => m.system === system && m.timestamp > oneHourAgo
    );

    const totalRequests = recentPerformance.length;
    const successfulRequests = recentPerformance.filter(m => m.success).length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 100;
    const errorRate = totalRequests > 0 ? (recentErrors.length / totalRequests) * 100 : 0;
    const averageResponseTime = totalRequests > 0 
      ? recentPerformance.reduce((sum, m) => sum + m.duration, 0) / totalRequests 
      : 0;

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (errorRate > 10 || successRate < 80) {
      status = 'error';
    } else if (errorRate > 5 || successRate < 90) {
      status = 'warning';
    }

    return {
      system,
      status,
      metrics: {
        averageResponseTime,
        successRate,
        errorRate,
        totalRequests,
        recentErrors: recentErrors.slice(-5) // Last 5 errors
      },
      lastUpdated: now
    };
  }

  // Get comprehensive metrics for dashboard
  getMetricsSummary(): {
    oldSystem: SystemHealth;
    newSystem: SystemHealth;
    abTestGroup: string;
    recommendations: string[];
  } {
    const oldSystemHealth = this.getSystemHealth('old');
    const newSystemHealth = this.getSystemHealth('new');
    const recommendations: string[] = [];

    // Generate recommendations
    if (newSystemHealth.metrics.averageResponseTime < oldSystemHealth.metrics.averageResponseTime) {
      recommendations.push('New system shows better performance');
    }
    if (newSystemHealth.metrics.errorRate > oldSystemHealth.metrics.errorRate) {
      recommendations.push('New system has higher error rate');
    }
    if (oldSystemHealth.status === 'error' && newSystemHealth.status === 'healthy') {
      recommendations.push('Consider switching to new system');
    }
    if (newSystemHealth.status === 'error') {
      recommendations.push('New system needs attention - consider fallback');
    }

    return {
      oldSystem: oldSystemHealth,
      newSystem: newSystemHealth,
      abTestGroup: this.abTestGroup,
      recommendations
    };
  }

  // Performance tracking helpers
  startTimer(): number {
    return Date.now();
  }

  // Wrapper for tracking async operations
  async trackAsyncOperation<T>(
    operation: string,
    system: 'old' | 'new',
    asyncFn: () => Promise<T>,
    sessionId?: string
  ): Promise<T> {
    const startTime = this.startTimer();
    
    try {
      const result = await asyncFn();
      this.trackPerformance(operation, system, startTime, true, undefined, sessionId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      this.trackPerformance(operation, system, startTime, false, errorMessage, sessionId);
      this.trackError(errorMessage, system, operation, errorStack, undefined, sessionId);
      
      throw error;
    }
  }

  // Storage management
  private saveMetricsToStorage(): void {
    try {
      const data = {
        performance: this.performanceMetrics.slice(-100), // Keep last 100
        usage: this.usageMetrics.slice(-100),
        errors: this.errorMetrics.slice(-50),
        abTestGroup: this.abTestGroup,
        lastSaved: Date.now()
      };
      
      localStorage.setItem('chatSystemMetrics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save metrics to localStorage:', error);
    }
  }

  private loadStoredMetrics(): void {
    try {
      const stored = localStorage.getItem('chatSystemMetrics');
      if (stored) {
        const data = JSON.parse(stored);
        this.performanceMetrics = data.performance || [];
        this.usageMetrics = data.usage || [];
        this.errorMetrics = data.errors || [];
        
        // Clean old metrics (older than 24 hours)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > oneDayAgo);
        this.usageMetrics = this.usageMetrics.filter(m => m.timestamp > oneDayAgo);
        this.errorMetrics = this.errorMetrics.filter(m => m.timestamp > oneDayAgo);
      }
    } catch (error) {
      console.warn('Failed to load metrics from localStorage:', error);
    }
  }

  private trimMetrics(metrics: any[]): void {
    if (metrics.length > this.maxMetrics) {
      metrics.splice(0, metrics.length - this.maxMetrics);
    }
  }

  private startPeriodicCleanup(): void {
    // Clean old metrics every hour
    setInterval(() => {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > oneDayAgo);
      this.usageMetrics = this.usageMetrics.filter(m => m.timestamp > oneDayAgo);
      this.errorMetrics = this.errorMetrics.filter(m => m.timestamp > oneDayAgo);
      this.saveMetricsToStorage();
    }, 60 * 60 * 1000); // Every hour
  }

  // Reset all metrics (for testing)
  resetMetrics(): void {
    this.performanceMetrics = [];
    this.usageMetrics = [];
    this.errorMetrics = [];
    localStorage.removeItem('chatSystemMetrics');
    localStorage.removeItem('abTestGroup');
    this.determineABTestGroup();
  }

  // Export metrics for analytics
  exportMetrics(): {
    performance: PerformanceMetric[];
    usage: UsageMetric[];
    errors: ErrorMetric[];
    summary: any;
  } {
    return {
      performance: this.performanceMetrics,
      usage: this.usageMetrics,
      errors: this.errorMetrics,
      summary: this.getMetricsSummary()
    };
  }
}

// Export singleton instance
export const chatSystemMonitoring = new ChatSystemMonitoring();
export default chatSystemMonitoring;
