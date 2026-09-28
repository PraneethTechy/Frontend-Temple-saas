import React, { type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks.js';
import { ROUTES } from '../constants/routes.js';

export interface ProtectedRouteProps {
  children: ReactElement;
  redirectTo?: string;
}

/**
 * ProtectedRoute Guard
 * Verifies that a user is authenticated before allowing access to the child route.
 * Redirects to appropriate login page if unauthenticated.
 */
export const ProtectedRoute = ({
  children,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps): ReactElement => {
  const { isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
