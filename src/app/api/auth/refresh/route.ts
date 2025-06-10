import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('directus_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Token di refresh non trovato' },
        { status: 401 }
      );
    }

    // Refresh token with Directus
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json(
        { error: 'Configurazione server non valida' },
        { status: 500 }
      );
    }

    const refreshResponse = await fetch(`${directusUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      console.error('Directus refresh error:', refreshData);
      return NextResponse.json(
        { error: 'Token scaduto, riaccedere' },
        { status: 401 }
      );
    }

    // Get user info with new token
    const userResponse = await fetch(`${directusUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${refreshData.data.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Impossibile verificare le informazioni utente' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();

    // Update cookies with new tokens
    cookieStore.set('directus_session_token', refreshData.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    if (refreshData.data.refresh_token) {
      cookieStore.set('directus_refresh_token', refreshData.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    // Update user info cookie
    cookieStore.set('directus_user', JSON.stringify({
      id: userData.data.id,
      email: userData.data.email,
      first_name: userData.data.first_name,
      last_name: userData.data.last_name,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userData.data.id,
        email: userData.data.email,
        first_name: userData.data.first_name,
        last_name: userData.data.last_name,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 