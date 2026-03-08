import {
  LogIn,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';
import { useAuth } from '~/context/AuthContext';
import { useIsNewsSite } from '~/hooks/useIsNewsSite';
import { formatDateline } from '~/utils/dateUtils';
import { UserMenu } from '../auth/UserMenu';
import AlertBell from './AlertBell';

const Header: React.FC = memo(() => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const isNews = useIsNewsSite();
  const dateline = isNews ? formatDateline() : '';

  const authControls = (
    <div className="flex items-center space-x-3 flex-shrink-0">
      {isLoading ? (
        <div className="w-8 h-8 animate-pulse bg-gray-300 rounded-full" />
      ) : isAuthenticated && user ? (
        <div className="flex items-center space-x-3">
          {user.emailVerified === false && (
            <div className="hidden sm:flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              verify email
            </div>
          )}
          {!isNews && (
            <>
              <AlertBell />
              <Link
                href="/settings"
                className="p-2 text-airq-dark hover:text-airq-contrast hover:bg-gray-100 rounded-md transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </>
          )}
          <UserMenu user={user} />
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Link
            href="/login"
            className="flex items-center space-x-1 text-airq-dark hover:text-airq-contrast focus:outline-none focus:ring-2 focus:ring-airq-contrast focus:ring-offset-2 rounded-md px-3 py-1 text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            <span>sign in</span>
          </Link>
        </div>
      )}
    </div>
  );

  if (isNews) {
    return (
      <header className="bg-airq-light z-20">
        {/* Thin top rule */}
        <div className="h-[3px] bg-airq-dark" />

        <div className="px-2 sm:px-6 md:px-12">
          {/* Dateline row */}
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-mono text-airq-dark/40 uppercase tracking-[0.2em] mt-2 pl-1">
              {dateline}
            </p>
          </div>

          {/* Masthead */}
          <div className="pb-2">
            <h1 className="masthead text-4xl sm:text-5xl md:text-6xl text-airq-dark tracking-tight leading-none">
              Puryear Gazette
            </h1>
          </div>
        </div>

        {/* Double rule bottom */}
        <div className="border-t border-airq-dark/30" />
        <div className="h-[2px] bg-airq-dark mt-[2px]" />
      </header>
    );
  }

  return (
    <header className="bg-airq-light border-b-airq-dark border-b-[1px] z-20 h-16 drop-shadow-md">
      <div className="flex items-center justify-between px-6 h-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl text-airq-dark truncate">Hudson Air</h1>
        {authControls}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
