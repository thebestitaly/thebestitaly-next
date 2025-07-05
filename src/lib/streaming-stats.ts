// 📊 STREAMING PROXY PERFORMANCE TRACKING
// Utility functions for monitoring streaming proxy performance

// Simple performance tracking
let requestCount = 0;
let totalResponseTime = 0;
let errorCount = 0;
let peakMemoryUsage = 0;

export function incrementRequestCount() {
  requestCount++;
}

export function addResponseTime(time: number) {
  totalResponseTime += time;
}

export function incrementErrorCount() {
  errorCount++;
}

export function resetStats() {
  requestCount = 0;
  totalResponseTime = 0;
  errorCount = 0;
  peakMemoryUsage = 0;
}

export function getStats() {
  // Get current memory usage
  const usage = process.memoryUsage();
  const memoryUsagePercent = (usage.heapUsed / usage.heapTotal) * 100;
  
  // Update peak memory if needed
  if (usage.heapUsed > peakMemoryUsage) {
    peakMemoryUsage = usage.heapUsed;
  }

  return {
    timestamp: new Date().toISOString(),
    
    // Memory stats
    memory: {
      current: {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024), // MB
        rss: Math.round(usage.rss / 1024 / 1024), // MB
        usagePercent: Math.round(memoryUsagePercent * 100) / 100
      },
      peak: {
        heapUsed: Math.round(peakMemoryUsage / 1024 / 1024) // MB
      }
    },
    
    // Request stats
    requests: {
      total: requestCount,
      errors: errorCount,
      successRate: requestCount > 0 ? Math.round(((requestCount - errorCount) / requestCount) * 100) : 0,
      avgResponseTime: requestCount > 0 ? Math.round(totalResponseTime / requestCount) : 0
    },
    
    // Configuration
    config: {
      maxBufferSize: process.env.MAX_BUFFER_SIZE || '10485760',
      memoryThreshold: process.env.MEMORY_THRESHOLD_PERCENT || '80',
      maxConcurrent: process.env.MAX_CONCURRENT_CONNECTIONS || '20',
      streamTimeout: process.env.STREAM_TIMEOUT || '30000',
      streamingEnabled: process.env.ENABLE_STREAMING_PROXY === 'true',
      optimizedClientEnabled: process.env.USE_OPTIMIZED_CLIENT === 'true',
      memoryLogging: process.env.ENABLE_MEMORY_LOGGING === 'true'
    },
    
    // Environment info
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      nodeEnv: process.env.NODE_ENV,
      uptime: Math.round(process.uptime())
    }
  };
} 