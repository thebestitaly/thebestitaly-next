import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;
    
    // Security: only allow specific widget files
    const allowedFiles = ['example.html', 'test.html', 'widget.js', 'widget-static.js'];
    
    if (!allowedFiles.includes(file)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    // Read file from public/widgets
    const filePath = join(process.cwd(), 'public', 'widgets', file);
    const fileContent = readFileSync(filePath, 'utf8');
    
    // Set appropriate content type
    const contentType = file.endsWith('.js') ? 'application/javascript' : 'text/html';
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('Widget API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 