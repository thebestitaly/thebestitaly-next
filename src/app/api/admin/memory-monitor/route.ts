import { NextRequest, NextResponse } from 'next/server';
import v8 from 'v8';
import fs from 'fs';
import path from 'path';

// 🚨 EMERGENCY MEMORY MONITORING
let memoryStats: any[] = [];
let lastCleanup = 0;
const MAX_STATS_HISTORY = 50;

// Memory thresholds (MB) - 🎯 BALANCED: Ragionevoli per produzione
const MEMORY_THRESHOLDS = {
  GOOD: 100,      // <100MB = performance eccellente
  WARNING: 200,   // 100-200MB = buona performance
  CRITICAL: 350,  // 200-350MB = monitora da vicino
  EMERGENCY: 450, // >350MB = kill switch a 500MB
};

function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    timestamp: Date.now(),
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  };
}

function forceCleanup() {
  console.log('🚨 EMERGENCY MEMORY CLEANUP');
  try {
    // Clear memory stats history
    memoryStats = memoryStats.slice(-10);
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('✅ Forced garbage collection');
    }
    
    lastCleanup = Date.now();
    return true;
  } catch {
    console.error('❌ Failed emergency cleanup');
    return false;
  }
}

function trackMemory() {
  const currentMemory = getMemoryUsage();
  
  // Add to history
  memoryStats.push(currentMemory);
  if (memoryStats.length > MAX_STATS_HISTORY) {
    memoryStats = memoryStats.slice(-MAX_STATS_HISTORY);
  }
  
  // Check thresholds ottimizzati per scalabilità
  if (currentMemory.heapUsed > MEMORY_THRESHOLDS.EMERGENCY) {
    forceCleanup();
    return { level: 'EMERGENCY', ...currentMemory, message: 'Memoria critica! Cleanup forzato' };
  } else if (currentMemory.heapUsed > MEMORY_THRESHOLDS.CRITICAL) {
    return { level: 'CRITICAL', ...currentMemory, message: 'Memoria alta, monitorare' };
  } else if (currentMemory.heapUsed > MEMORY_THRESHOLDS.WARNING) {
    return { level: 'WARNING', ...currentMemory, message: 'Performance buona, scalabile' };
  } else if (currentMemory.heapUsed <= MEMORY_THRESHOLDS.GOOD) {
    return { level: 'EXCELLENT', ...currentMemory, message: 'Performance eccellente!' };
  }
  
  return { level: 'GOOD', ...currentMemory, message: 'Performance ottima' };
}

// GET: Monitor memory usage
export async function GET() {
  try {
    const currentStatus = trackMemory();
    const averageMemory = memoryStats.length > 5 ? 
      Math.round(memoryStats.slice(-5).reduce((sum, stat) => sum + stat.heapUsed, 0) / 5) : 
      currentStatus.heapUsed;
    
    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      current: currentStatus,
      average5min: averageMemory,
      thresholds: MEMORY_THRESHOLDS,
      history: memoryStats.slice(-20), // Last 20 measurements
      stats: {
        totalMeasurements: memoryStats.length,
        lastCleanup: lastCleanup,
        uptimeMinutes: Math.round(process.uptime() / 60)
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Memory monitoring failed',
      details: error.message
    }, { status: 500 });
  }
}

// POST: Force cleanup or reset monitoring
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'cleanup') {
      const success = forceCleanup();
      return NextResponse.json({
        success,
        message: success ? 'Emergency cleanup executed' : 'Cleanup failed',
        memory: getMemoryUsage()
      });
    }
    
    if (action === 'reset') {
      memoryStats = [];
      return NextResponse.json({
        success: true,
        message: 'Memory monitoring reset',
        memory: getMemoryUsage()
      });
    }

    if (action === 'snapshot') {
      const snapshotDir = '/tmp'; // Use /tmp as it's generally writable
      if (!fs.existsSync(snapshotDir)) {
        fs.mkdirSync(snapshotDir, { recursive: true });
      }
      const filename = `snapshot-${Date.now()}.heapsnapshot`;
      const filePath = path.join(snapshotDir, filename);
      
      const snapshotStream = v8.getHeapSnapshot();
      const fileStream = fs.createWriteStream(filePath);
      snapshotStream.pipe(fileStream);

      return new Promise((resolve) => {
        fileStream.on('finish', () => {
          resolve(NextResponse.json({
            success: true,
            message: 'Heap snapshot successfully created.',
            path: filePath
          }));
        });
        fileStream.on('error', (err) => {
          console.error('❌ Failed to write heap snapshot', err);
          resolve(NextResponse.json({
            success: false,
            error: 'Failed to write heap snapshot',
            details: err.message
          }, { status: 500 }));
        });
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use cleanup, reset, or snapshot'
    }, { status: 400 });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Request failed',
      details: error.message
    }, { status: 500 });
  }
} 