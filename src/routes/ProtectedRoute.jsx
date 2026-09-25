import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../constants/routes.js';

/**
 * ProtectedRoute Guard
 * Verifies that a user is authenticated before allowing access to the child route.
 * Redirects to appropriate login page if unauthenticated.
 */
export const ProtectedRoute = ({ children, redirectTo = ROUTES.LOGIN }) => {
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
