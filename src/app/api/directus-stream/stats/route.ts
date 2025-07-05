import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/streaming-stats';

export async function GET(request: NextRequest) {
  try {
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get stats', details: error.message },
      { status: 500 }
    );
  }
} 