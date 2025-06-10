import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
  
  if (!directusUrl) {
    return NextResponse.json({ error: 'Directus URL not configured' }, { status: 500 });
  }

  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${directusUrl}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const token = process.env.DIRECTUS_TOKEN || process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;
  
  if (!directusUrl) {
    return NextResponse.json({ error: 'Directus URL not configured' }, { status: 500 });
  }

  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const url = `${directusUrl}/${path}`;
  const body = await request.text();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
} 