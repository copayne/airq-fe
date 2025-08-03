import {
  LogIn
} from 'lucide-react';
import Link from 'next/link';
import React, { memo } from 'react';
import { useAuth } from '~/context/AuthContext';
import { UserMenu } from '../auth/UserMenu';

const Header: React.FC = memo(() => {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <header className="bg-default-textLight border-b-default-dark border-b-[1px] z-20 h-16 drop-shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          {/* <button className="text-default-textDark hover:text-default-contrast focus:outline-none">
            <Menu className="h-6 w-6" />
          </button> */}
          <Link
            href="/dash"
          >
            <h1 className="text-xl font-semibold text-default-textDark">hudson dash</h1>
          </Link>
        </div>

        {/* Authentication UI */}
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="w-8 h-8 animate-pulse bg-gray-300 rounded-full"></div>
          ) : isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              {user.emailVerified === false && (
                <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  verify email
                </div>
              )}
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="flex items-center space-x-1 text-default-textDark hover:text-default-contrast focus:outline-none focus:ring-2 focus:ring-default-contrast focus:ring-offset-2 rounded-md px-3 py-1 text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                <span>sign in</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
});

Header.displayName = 'Header';

export default Header;