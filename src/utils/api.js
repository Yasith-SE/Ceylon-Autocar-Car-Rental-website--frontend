import { AUTH_STORAGE_KEY } from '../context/auth-context';

const DEFAULT_API_BASE_URL = 'http://localhost:8081/api';

const normalizePath = (path = '') => (path.startsWith('/') ? path : `/${path}`);

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const API_BASE_URL =
  trimTrailingSlash(import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL);

export const BACKEND_ASSET_BASE_URL = trimTrailingSlash(API_BASE_URL.replace(/\/api$/i, ''));

export const buildApiUrl = (path) => `${API_BASE_URL}${normalizePath(path)}`;

export const buildBackendAssetUrl = (value = '') => {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  if (/^(data:|blob:)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  const normalizedValue = trimmedValue.replace(/\\/g, '/');
  const normalizedUploadPath = normalizedValue
    .replace(/^\/+api\/uploads\//i, '/uploads/')
    .replace(/^api\/uploads\//i, 'uploads/');

  if (/^https?:\/\//i.test(normalizedUploadPath)) {
    try {
      const parsedUrl = new URL(normalizedUploadPath);
      const normalizedPathname = parsedUrl.pathname.replace(/^\/api\/uploads\//i, '/uploads/');

      if (/^\/uploads\//i.test(normalizedPathname)) {
        return `${BACKEND_ASSET_BASE_URL}${normalizedPathname}${parsedUrl.search}${parsedUrl.hash}`;
      }

      return parsedUrl.toString();
    } catch {
      return normalizedUploadPath;
    }
  }

  if (/^\/?uploads\//i.test(normalizedUploadPath)) {
    return `${BACKEND_ASSET_BASE_URL}/${normalizedUploadPath.replace(/^\/+/, '')}`;
  }

  return normalizedUploadPath;
};

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
