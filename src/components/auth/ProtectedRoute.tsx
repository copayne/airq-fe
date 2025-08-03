'use client';

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '~/context/AuthContext';
import type { User } from '~/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'viewer';
  fallback?: ReactNode;
  redirectTo?: string;
}

interface RoleRequirement {
  admin: number;
  user: number;
  viewer: number;
}

const roleHierarchy: RoleRequirement = {
  admin: 3,
  user: 2,
  viewer: 1,
};

function hasPermission(user: User, requiredRole: 'admin' | 'user' | 'viewer'): boolean {
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = 'viewer', 
  fallback,
  redirectTo 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        const currentPath = router.asPath;
        const loginUrl = redirectTo ?? `/login?redirect=${encodeURIComponent(currentPath)}`;
        void router.replace(loginUrl);
        return;
      }

      // Authenticated but insufficient permissions
      if (user && !hasPermission(user, requiredRole)) {
        // Redirect to unauthorized page or back to dashboard
        void router.replace('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated or insufficient permissions
  if (!isAuthenticated || (user && !hasPermission(user, requiredRole))) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}

// Higher-order component version
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: 'admin' | 'user' | 'viewer' = 'viewer'
) {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName ?? Component.name})`;

  return WrappedComponent;
}

// Convenience exports for common role requirements
export const AdminRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="user" {...props}>
    {children}
  </ProtectedRoute>
);

export const ViewerRoute = ({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) => (
  <ProtectedRoute requiredRole="viewer" {...props}>
    {children}
  </ProtectedRoute>
);