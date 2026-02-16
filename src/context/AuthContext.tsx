'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '~/types/auth';
import { jwtDecode } from 'jwt-decode';
import { env } from '~/env.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

interface JWTPayload {
  user_id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'TOKEN_EXPIRED' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check for existing token
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'LOGOUT':
    case 'TOKEN_EXPIRED':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.type === 'TOKEN_EXPIRED' ? 'Your session has expired. Please log in again.' : null,
      };
    default:
      return state;
  }
}

/** Auto-login via direct GraphQL call. Bypasses Apollo to avoid circular deps. */
async function autoLogin(): Promise<{ token: string; user: User } | null> {
  try {
    const res = await fetch(env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation LoginUser($input: LoginInput!) {
          loginUser(input: $input) {
            success
            message
            token
            user {
              id username email firstName lastName fullName
              role isActive emailVerified createdAt updatedAt lastLogin
            }
          }
        }`,
        variables: {
          input: {
            usernameOrEmail: 'copayne',
            password: 'dork-modem-alien',
          },
        },
      }),
    });

    const json = await res.json() as {
      data?: { loginUser: { success: boolean; token: string; user: User } };
    };
    const payload = json.data?.loginUser;

    if (payload?.success && payload.token && payload.user) {
      return { token: payload.token, user: payload.user };
    }
  } catch (err) {
    console.error('Auto-login failed:', err);
  }
  return null;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount, auto-login if missing/expired
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('auth_user');

        if (token && userData) {
          const decoded = jwtDecode<JWTPayload>(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp > currentTime) {
            const user = JSON.parse(userData) as User;
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
            return;
          }
        }

        // No valid token - auto-login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        const result = await autoLogin();
        if (result) {
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('auth_user', JSON.stringify(result.user));
          dispatch({ type: 'LOGIN_SUCCESS', payload: result });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error during auth init:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    void initAuth();
  }, []);

  const login = (token: string, user: User) => {
    try {
      // Store in localStorage for persistence
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });
    } catch (error) {
      console.error('Error storing authentication data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to store authentication data' });
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Still dispatch logout even if localStorage fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (user: User) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    updateUser,
    clearError,
    setLoading,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
