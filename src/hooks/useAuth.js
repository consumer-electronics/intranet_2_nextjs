'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, loginWithGoogle as loginWithGoogleRequest } from '@/api/auth';

export function useAuth({ redirectOnUnauthenticated = true } = {}) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const { user: currentUser, mustChangePassword } = await getCurrentUser();
        if (!active) return;

        setUser(currentUser);

        if (mustChangePassword) {
          router.replace('/login/change-password');
        }
      } catch (err) {
        if (!active) return;
        setError(err);
        if (redirectOnUnauthenticated) {
          router.replace('/login');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [router, redirectOnUnauthenticated]);

  const login = useCallback(
    async (credentials) => {
      const { user: loggedUser, mustChangePassword } = await loginRequest(credentials);
      setUser(loggedUser);
      router.replace(mustChangePassword ? '/login/change-password' : '/home');
      return { user: loggedUser, mustChangePassword };
    },
    [router]
  );

  const loginWithGoogle = useCallback(
    async (credential) => {
      const { user: loggedUser, mustChangePassword } = await loginWithGoogleRequest({ credential });
      setUser(loggedUser);
      router.replace(mustChangePassword ? '/login/change-password' : '/home');
      return { user: loggedUser, mustChangePassword };
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      router.replace('/login');
    }
  }, [router]);

  return { user, loading, error, login, loginWithGoogle, logout };
}