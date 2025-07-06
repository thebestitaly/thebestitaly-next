import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Ottieni statistiche memoria Node.js
    const memoryUsage = process.memoryUsage();
    
    // Converti da byte a MB
    const formatMemory = (bytes: number) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    const memoryStats = {
      timestamp: new Date().toISOString(),
      memory: {
        rss: formatMemory(memoryUsage.rss), // Resident Set Size (total memory)
        heapUsed: formatMemory(memoryUsage.heapUsed), // Heap used
        heapTotal: formatMemory(memoryUsage.heapTotal), // Total heap
        external: formatMemory(memoryUsage.external), // External memory
      },
      usage: {
        rss_mb: formatMemory(memoryUsage.rss),
        heap_used_mb: formatMemory(memoryUsage.heapUsed),
        heap_total_mb: formatMemory(memoryUsage.heapTotal),
        external_mb: formatMemory(memoryUsage.external),
      },
      status: memoryUsage.heapUsed > 400 * 1024 * 1024 ? 'WARNING' : 'OK',
      target: '300-400MB heap used',
    };
    
    return NextResponse.json({
      success: true,
      data: memoryStats,
    });
    
  } catch (error) {
    console.error('Errore nel monitoraggio memoria:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel monitoraggio memoria' },
      { status: 500 }
    );
  }
} 