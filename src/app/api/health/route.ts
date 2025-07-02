import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check - just verify the server is responding
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        limit: process.env.NODE_OPTIONS || 'not set'
      },
      deployment: {
        version: '1.0.1',
        timestamp: '2025-01-22T15:30:00Z',
        memory_fix: 'Applied 1024MB limit',
        commit: 'Force deploy - memory fix critical'
      }
    }, { status: 200 });
  } catch (error) {
    console.error('[HEALTH CHECK] Error:', error);
    return NextResponse.json({ 
      status: 'unhealthy',
      error: 'Server error' 
    }, { status: 500 });
  }
} 