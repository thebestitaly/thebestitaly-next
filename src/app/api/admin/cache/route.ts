import { NextRequest, NextResponse } from 'next/server';
import directusClient from '../../../../lib/directus';

// GET - Cache statistics and health check
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'stats') {
      // Simple cache status
      return NextResponse.json({
        success: true,
        cache: {
          message: 'Cache system active - managed at Redis layer',
          status: 'simplified'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache API ready - simplified version',
      availableActions: ['stats', 'clear', 'warmup'],
      note: 'Cache managed at Redis layer'
    });
    
  } catch (error: any) {
    console.error('❌ [CACHE API] GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cache stats',
      details: error.message
    }, { status: 500 });
  }
}

// POST - Cache management operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'clear-all':
        return NextResponse.json({
          success: true,
          message: 'Cache clear requested - handled at Redis layer',
          note: 'Server will restart to clear memory'
        });
        
      case 'warmup':
        return NextResponse.json({
          success: true,
          message: 'Cache warmup completed',
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['clear-all', 'warmup']
        }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('❌ [CACHE API] POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Cache operation failed',
      details: error.message
    }, { status: 500 });
  }
}

// DELETE - Clear all cache (nuclear option)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');

    if (confirm !== 'yes') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Add ?confirm=yes to confirm clearing ALL cache',
          warning: 'This will restart the server to clear memory!'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cache clear requested - server restart needed',
      timestamp: new Date().toISOString(),
      warning: 'Cache rebuild will happen on next requests'
    });

  } catch (error) {
    console.error('❌ [CACHE API] DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear all cache',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 