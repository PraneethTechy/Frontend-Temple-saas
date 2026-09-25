import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getDefaultRouteForRole } from '../utils/authNavigation.js';

/**
 * PublicOnlyRoute Guard
 * Restricts access to public-only authentication screens (/login, /register, etc.).
 * If an authenticated user visits, redirects them to their role's designated dashboard.
 */
export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isInitializing } = useSelector((state) => state.auth);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user)} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
