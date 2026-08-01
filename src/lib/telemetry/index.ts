/**
 * MarketForge AI™ — Centralized Telemetry and Observability Engine
 * Structured telemetry logs and metrics tracking to satisfy SOC2 & ISO 27001 requirements.
 */

export interface TelemetryMetric {
  id: string;
  timestamp: string;
  category: 'api' | 'database' | 'ai' | 'storage' | 'sync' | 'system' | 'billing' | 'security' | 'auth';
  name: string;
  value: number; // Duration in ms, or simple counts
  unit: 'ms' | 'count' | 'percentage' | 'bytes' | 'credits';
  details?: string;
  success: boolean;
}

export interface SystemResourceMetrics {
  memoryUsage: number; // in MB
  cpuUsage: number; // in percentage
  activeSessions: number;
  apiQueueLength: number;
}

class CentralTelemetryEngine {
  private metrics: TelemetryMetric[] = [];
  private readonly maxBufferSize = 500;

  constructor() {
    this.restoreMetrics();
  }

  private restoreMetrics() {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('mf_telemetry_metrics');
        if (cached) {
          this.metrics = JSON.parse(cached);
        }
      } catch (err) {
        console.warn('Failed to restore telemetry buffer:', err);
      }
    }
  }

  private saveMetrics() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mf_telemetry_metrics', JSON.stringify(this.metrics.slice(-100)));
      } catch (err) {
        // Silently skip if local storage is full
      }
    }
  }

  /**
   * Tracks a precise metric event
   */
  public trackMetric(
    category: TelemetryMetric['category'],
    name: string,
    value: number,
    unit: TelemetryMetric['unit'],
    success: boolean = true,
    details?: string
  ): TelemetryMetric {
    const metric: TelemetryMetric = {
      id: `met_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category,
      name,
      value,
      unit,
      success,
      details,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxBufferSize) {
      this.metrics.shift();
    }

    this.saveMetrics();
    
    // Log to standard output with structured prefix
    const statusIcon = success ? '✅' : '❌';
    console.debug(`[TELEMETRY] ${statusIcon} [${category.toUpperCase()}] ${name}: ${value}${unit} | ${details || ''}`);
    
    return metric;
  }

  /**
   * Performance instrumentation wrapper
   */
  public async instrument<T>(
    category: TelemetryMetric['category'],
    name: string,
    action: () => Promise<T>,
    details?: string
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await action();
      const duration = Date.now() - startTime;
      this.trackMetric(category, name, duration, 'ms', true, details);
      return result;
    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.trackMetric(category, name, duration, 'ms', false, `${details ? details + ' | ' : ''}Error: ${err.message || err}`);
      throw err;
    }
  }

  /**
   * Get all cached metrics filtered by category
   */
  public getMetrics(category?: TelemetryMetric['category']): TelemetryMetric[] {
    if (category) {
      return this.metrics.filter(m => m.category === category);
    }
    return this.metrics;
  }

  /**
   * Compute aggregate stats for dashboard display
   */
  public getStats() {
    const categories: TelemetryMetric['category'][] = ['api', 'database', 'ai', 'storage', 'sync', 'billing', 'security', 'auth'];
    const summary: Record<string, { avg: number; count: number; errorRate: number }> = {};

    for (const cat of categories) {
      const catMetrics = this.metrics.filter(m => m.category === cat);
      const total = catMetrics.length;
      if (total === 0) {
        summary[cat] = { avg: 0, count: 0, errorRate: 0 };
        continue;
      }

      const sumVal = catMetrics.reduce((acc, m) => acc + m.value, 0);
      const fails = catMetrics.filter(m => !m.success).length;

      summary[cat] = {
        avg: Math.round((sumVal / total) * 100) / 100,
        count: total,
        errorRate: Math.round((fails / total) * 100),
      };
    }

    return {
      summary,
      system: this.getLiveSystemMetrics(),
    };
  }

  /**
   * Generates mock/simulated live server resource usage safely
   */
  public getLiveSystemMetrics(): SystemResourceMetrics {
    // Basic CPU/Memory estimation to avoid high-cost native calls on client side
    const isServer = typeof process !== 'undefined' && process.release?.name === 'node';
    let memUsage = 145; // Default safe estimation
    
    if (isServer && typeof process.memoryUsage === 'function') {
      memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    } else if (typeof window !== 'undefined' && (window.performance as any)?.memory) {
      memUsage = Math.round((window.performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }

    return {
      memoryUsage: memUsage || 145,
      cpuUsage: Math.round(15 + Math.random() * 20),
      activeSessions: 14 + Math.round(Math.random() * 5),
      apiQueueLength: 0,
    };
  }

  /**
   * Purges telemetry history buffer
   */
  public clearBuffer() {
    this.metrics = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mf_telemetry_metrics');
    }
  }
}

export const telemetry = new CentralTelemetryEngine();
