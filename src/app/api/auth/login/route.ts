import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono richiesti' },
        { status: 400 }
      );
    }

    // Authenticate with Directus
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json(
        { error: 'Configurazione server non valida' },
        { status: 500 }
      );
    }

    const authResponse = await fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      console.error('Directus auth error:', authData);
      return NextResponse.json(
        { error: 'Email o password non validi' },
        { status: 401 }
      );
    }

    // Check if user exists and is active
    if (!authData.data?.access_token) {
      return NextResponse.json(
        { error: 'Risposta di autenticazione non valida' },
        { status: 500 }
      );
    }

    // Get user info to verify they exist in Directus
    const userResponse = await fetch(`${directusUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authData.data.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Impossibile verificare le informazioni utente' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    
    // Check if user is active
    if (userData.data?.status !== 'active') {
      return NextResponse.json(
        { error: 'Account non attivo' },
        { status: 401 }
      );
    }

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: userData.data.id,
        email: userData.data.email,
        first_name: userData.data.first_name,
        last_name: userData.data.last_name,
        role: userData.data.role,
      },
    });

    // Set cookies using response headers
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set access token cookie (expires in 15 minutes)
    response.cookies.set('directus_session_token', authData.data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Set refresh token cookie (expires in 7 days)
    if (authData.data.refresh_token) {
      response.cookies.set('directus_refresh_token', authData.data.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    // Set user info cookie (for client-side access)
    const userInfo = JSON.stringify({
      id: userData.data.id,
      email: userData.data.email,
      first_name: userData.data.first_name,
      last_name: userData.data.last_name,
    });
    
    response.cookies.set('directus_user', userInfo, {
      httpOnly: false, // Client-side accessible
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    console.log('Login successful, setting cookies for user:', userData.data.email);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 