"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    
    // Also check auth when cookies change
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const checkAuth = () => {
    try {
      // Check for user info in cookie
      const userCookie = getCookie('directus_user');

      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Force clear client-side state
        setUser(null);
        
        // Clear any client-side storage as well
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Silent fail for storage clearing
        }
        
        // Force a hard redirect to bypass any cache
        window.location.href = '/it/reserved/login';
      } else {
        console.error('Logout API call failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API fails, clear local state and redirect
      setUser(null);
      window.location.href = '/it/reserved/login';
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    checkAuth,
  };
} 