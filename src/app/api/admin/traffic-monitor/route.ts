import { NextRequest, NextResponse } from 'next/server';

// Contatori in memoria per il traffico (in produzione usare Redis)
let trafficStats = {
  totalRequests: 0,
  totalBytes: 0,
  imageRequests: 0,
  apiRequests: 0,
  pageRequests: 0,
  lastReset: new Date().toISOString(),
  dailyStats: {} as Record<string, { requests: number; bytes: number }>,
};

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Calcola statistiche giornaliere
    const todayStats = trafficStats.dailyStats[today] || { requests: 0, bytes: 0 };
    
    // Stima costi basata sui prezzi Railway
    const estimatedCost = {
      egress: (trafficStats.totalBytes / (1024 * 1024 * 1024)) * 0.10, // $0.10 per GB
      daily: (todayStats.bytes / (1024 * 1024 * 1024)) * 0.10,
    };

    return NextResponse.json({
      success: true,
      stats: {
        ...trafficStats,
        today: todayStats,
        estimatedCost,
        averageRequestSize: trafficStats.totalRequests > 0 
          ? (trafficStats.totalBytes / trafficStats.totalRequests / 1024).toFixed(2) + ' KB'
          : '0 KB',
      }
    });
  } catch (error) {
    console.error('Error getting traffic stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get traffic stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, bytes, path } = await request.json();
    const today = new Date().toISOString().split('T')[0];
    
    // Aggiorna contatori
    trafficStats.totalRequests++;
    trafficStats.totalBytes += bytes || 0;
    
    // Categorizza per tipo
    if (path?.includes('/assets/') || path?.includes('image')) {
      trafficStats.imageRequests++;
    } else if (path?.includes('/api/')) {
      trafficStats.apiRequests++;
    } else {
      trafficStats.pageRequests++;
    }
    
    // Statistiche giornaliere
    if (!trafficStats.dailyStats[today]) {
      trafficStats.dailyStats[today] = { requests: 0, bytes: 0 };
    }
    trafficStats.dailyStats[today].requests++;
    trafficStats.dailyStats[today].bytes += bytes || 0;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating traffic stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update traffic stats' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Reset statistiche
    trafficStats = {
      totalRequests: 0,
      totalBytes: 0,
      imageRequests: 0,
      apiRequests: 0,
      pageRequests: 0,
      lastReset: new Date().toISOString(),
      dailyStats: {},
    };
    
    return NextResponse.json({ success: true, message: 'Traffic stats reset' });
  } catch (error) {
    console.error('Error resetting traffic stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset traffic stats' },
      { status: 500 }
    );
  }
} 