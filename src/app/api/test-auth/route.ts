import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    const token = process.env.DIRECTUS_TOKEN;

    if (!directusUrl || !token) {
      return NextResponse.json(
        { error: 'Missing Directus configuration' },
        { status: 500 }
      );
    }

    console.log('🔍 Testing Directus authentication...');
    console.log('URL:', directusUrl);
    console.log('Token:', token.substring(0, 10) + '...');

    // Test 1: Check user info
    const userResponse = await fetch(`${directusUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const userData = await userResponse.json();
    console.log('👤 User data:', userData);

    // Test 2: Check collections permissions
    const collectionsResponse = await fetch(`${directusUrl}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const collectionsData = await collectionsResponse.json();
    console.log('📋 Collections:', collectionsData);

    // Test 3: Try to read articles
    const articlesResponse = await fetch(`${directusUrl}/items/articles?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const articlesData = await articlesResponse.json();
    console.log('📰 Articles test:', articlesData);

    // Test 4: Try to read companies
    const companiesResponse = await fetch(`${directusUrl}/items/companies?limit=1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const companiesData = await companiesResponse.json();
    console.log('🏢 Companies test:', companiesData);

    return NextResponse.json({
      success: true,
      tests: {
        user: userData,
        collections: collectionsData,
        articles: articlesData,
        companies: companiesData
      }
    });

  } catch (error: any) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json(
      { 
        error: 'Auth test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
} 