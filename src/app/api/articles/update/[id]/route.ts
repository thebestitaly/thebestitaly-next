import { NextRequest, NextResponse } from 'next/server';
import directusWebClient from '@/lib/directus-web';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // TODO: This route should be moved to admin.thebestitaly.eu
  // Write operations are not allowed in the public web client
  return NextResponse.json(
    { error: 'Write operations not allowed. Use admin.thebestitaly.eu' },
    { status: 405 }
  );
} 