import { useEffect, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY, AuthContext } from './auth-context';
import { authFetch } from '../utils/api';

const readStoredSession = () => {
  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);

  const persistSession = (nextSession) => {
    setSession(nextSession);

    try {
      if (nextSession?.token && nextSession?.user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures and continue with in-memory auth state.
    }
  };

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || '',
      login: (authPayload) => {
        if (authPayload?.token && authPayload?.user) {
          persistSession({
            token: authPayload.token,
            user: authPayload.user,
          });
        } else {
          persistSession(null);
        }
      },
      logout: () => persistSession(null),
      updateUser: (partialUser) => {
        if (!session?.user) {
          return;
        }

        persistSession({
          ...session,
          user: {
            ...session.user,
            ...partialUser,
          },
        });
      },
    }),
    [session],
  );

  const sessionValidationToken = session?.token || '';
  const sessionValidationUserId = session?.user?.id || '';

  useEffect(() => {
    if (!sessionValidationToken || !sessionValidationUserId) {
      return;
    }

    let isActive = true;

    authFetch('/auth/me')
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));

        if (!isActive) {
          return;
        }

        if (!response.ok || !data.user) {
          persistSession(null);
          return;
        }

        persistSession({
          token: sessionValidationToken,
          user: data.user,
        });
      })
      .catch(() => {
        if (isActive) {
          persistSession(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [sessionValidationToken, sessionValidationUserId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
