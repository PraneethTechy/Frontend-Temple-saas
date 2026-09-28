import React, { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks.js';
import { getDefaultRouteForRole } from '../utils/authNavigation.js';

export interface PublicOnlyRouteProps {
  children: ReactElement;
}

/**
 * PublicOnlyRoute Guard
 * Restricts access to public-only authentication screens (/login, /register, etc.).
 * If an authenticated user visits, redirects them to their role's designated dashboard.
 */
export const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps): ReactElement => {
  const { user, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user)} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
