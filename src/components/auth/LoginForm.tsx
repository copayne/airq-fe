'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import React, { useCallback, useState } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useLogin } from '~/hooks/useAuthMutations';
import type { AuthFormData } from '~/types/auth';
import { getFieldError, hasFieldError, validateLoginForm } from '~/utils/authValidation';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { error: authError, clearError } = useAuth();
  const { loginUser, loading } = useLogin();
  
  const [formData, setFormData] = useState<AuthFormData>({
    usernameOrEmail: 'copayne',
    password: 'dork-modem-alien'
  });
  
  const [validationErrors, setValidationErrors] = useState<ReturnType<typeof validateLoginForm>['errors']>([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors(prev => prev.filter(error => error.field !== name));
    }
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault();
    
    // Clear previous errors
    clearError();
    setValidationErrors([]);
    
    // Validate form
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    // Submit login
    try {
      await loginUser({
        usernameOrEmail: formData.usernameOrEmail ?? '',
        password: formData.password ?? '',
      });
      
      // Handle success
      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        await router.push(redirectTo);
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('Login submission error:', error);
    } 
  }, [formData, clearError, loginUser, onSuccess, redirectTo, router]);

  const usernameOrEmailError = getFieldError(validationErrors, 'usernameOrEmail');
  const passwordError = getFieldError(validationErrors, 'password');

  return (
    <div className="w-full max-w-md mx-auto shadow-card border border-airq-dark px-4 sm:px-0">
      <div className="bg-airq-dark text-airq-light px-2 py-1 flex justify-between items-center border-b-[1px] border-black/80">
        <p className="text-xs font-semibold w-full h-full align-baseline">sign in</p>
      </div>
      <div className="bg-airq-light shadow-card px-4 sm:px-8 py-6">
        {authError && (
          <div className="mb-4 p-3 bg-airq-tertiary/20 border border-airq-tertiary shadow-card">
            <p className="text-sm text-airq-dark font-medium">{authError}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              id="usernameOrEmail"
              name="usernameOrEmail"
              value={formData.usernameOrEmail ?? ''}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 text-base border rounded-sm focus:outline-none focus:ring-2 focus:ring-airq-contrast focus:border-airq-contrast transition-colors ${
                hasFieldError(validationErrors, 'usernameOrEmail') || authError
                  ? 'border-airq-tertiary bg-airq-tertiary/10'
                  : 'border-airq-dark bg-white'
              }`}
              placeholder="username"
              disabled={loading}
              autoComplete="username"
              required
            />
            {usernameOrEmailError && (
              <p className="mt-1 text-sm text-airq-tertiary font-medium">{usernameOrEmailError}</p>
            )}
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password ?? ''}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 text-base border rounded-sm focus:outline-none focus:ring-2 focus:ring-airq-contrast focus:border-airq-contrast pr-12 transition-colors ${
                  hasFieldError(validationErrors, 'password') || authError
                    ? 'border-airq-tertiary bg-airq-tertiary/10'
                    : 'border-airq-dark bg-white'
                }`}
                placeholder="password"
                disabled={loading}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 hover:text-airq-contrast transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-airq-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-airq-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-airq-tertiary font-medium">{passwordError}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex justify-center shadow-card active:shadow-none py-3 px-6 border border-airq-dark rounded-sm text-base font-medium text-airq-light bg-airq-primary hover:bg-airq-primary/90 active:translate-y-0.5 active:translate-x-0.5 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-airq-primary"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  signing In...
                </>
              ) : (
                'sign in'
              )}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-airq-dark">
            <Link href="/forgot-password" className="font-medium text-airq-contrast hover:text-airq-contrast/80 transition-colors">
              forgot?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}