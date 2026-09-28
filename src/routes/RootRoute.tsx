import React, { type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks.js';
import { ROUTES } from '../constants/routes.js';
import { getDefaultRouteForRole } from '../utils/authNavigation.js';

/**
 * RootRoute
 * Handles the root URL ('/') navigation on startup and direct navigation.
 * Evaluates session status after auth initialization:
 * - Unauthenticated: Redirects to /login
 * - Authenticated: Redirects strictly to the user's role-based dashboard
 */
export const RootRoute = (): ReactElement => {
  const { user, isAuthenticated, isInitializing } = useAppSelector((state) => state.auth);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Navigate to={getDefaultRouteForRole(user)} replace />;
};

export default RootRoute;
