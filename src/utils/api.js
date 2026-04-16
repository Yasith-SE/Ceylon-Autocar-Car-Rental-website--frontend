import { AUTH_STORAGE_KEY } from '../context/auth-context';

const DEFAULT_API_BASE_URL = 'http://localhost:8091/api';

const normalizePath = (path = '') => (path.startsWith('/') ? path : `/${path}`);

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL =
  trimTrailingSlash(import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL);

export const buildApiUrl = (path) => `${API_BASE_URL}${normalizePath(path)}`;

export const buildDerivedWebSocketUrl = (path) => {
  const apiOrigin = API_BASE_URL.replace(/\/api$/i, '');
  const wsOrigin = apiOrigin.replace(/^http/i, 'ws');
  return `${trimTrailingSlash(wsOrigin)}${normalizePath(path)}`;
};

export const getStoredAuthSession = () => {
  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
};

export const getStoredAuthToken = () => getStoredAuthSession()?.token || '';

export const authFetch = async (path, init = {}) => {
  const token = getStoredAuthToken();
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
};
