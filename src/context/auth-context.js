import { createContext } from 'react';

export const AUTH_STORAGE_KEY = 'ceylon-autocar-auth-session';

export const AuthContext = createContext({
  user: null,
  token: '',
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});
