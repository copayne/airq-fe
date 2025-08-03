'use client';

import { ChevronDown, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useLogout } from '~/hooks/useAuthMutations';
import type { User as UserType } from '~/types/auth';

interface UserMenuProps {
  user: UserType;
}

export function UserMenu({ user }: UserMenuProps) {
  const { logoutUser, loading: logoutLoading } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    // The useLogout hook handles the redirect
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-default-textDark hover:text-default-contrast focus:outline-none focus:ring-2 focus:ring-default-contrast focus:ring-offset-2 px-2 py-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="hidden md:block text-sm font-medium">
          {user.fullName ?? user.username}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-default-textLight shadow-card ring-1 ring-black ring-opacity-5 z-50">
          <div>
            {/* User info */}
            <div className="px-4 py-3 border-b border-default-dark flex items-center bg-default-contrast">
              <p className="text-sm font-medium text-default-textLight">
                {user.fullName ?? user.username}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>

            {/* Menu items */}
            <div>
              <Link
                href="/profile"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-default-contrast/70 hover:text-default-textLight active:bg-default-contrast/90"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile Settings
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-default-contrast/70 hover:text-default-textLight active:bg-default-contrast/90"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              )}
            </div>
            {/* Logout */}
            <div className="border-t border-default-dark">
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-default-contrast/70 active:bg-default-contrast/90 hover:text-default-textLight disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logoutLoading ? (
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                {logoutLoading ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}