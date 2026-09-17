import { apiFetch } from '@/utils/Fetchclient';

/**
 * src/api/auth.js
 */

export async function getCurrentUser() {
  return apiFetch('/api/auth/me');
}

export async function login({ usuario, password, remember }) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { usuario, password, remember },
  });
}

export async function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export async function loginWithGoogle({ credential }) {
  return apiFetch('/api/auth/google-sso', {
    method: 'POST',
    body: { credential },
  });
}