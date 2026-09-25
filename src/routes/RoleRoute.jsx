import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../constants/routes.js';
import { USER_ROLES } from '../constants/roles.js';
import { getDefaultRouteForRole } from '../utils/authNavigation.js';

/**
 * RoleRoute Guard
 * Enforces that an authenticated user possesses one of the allowed roles.
 * If unauthenticated, redirects to the role's designated login screen.
 * If authenticated with the wrong role, redirects to the user's role dashboard.
 */
export const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isInitializing } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spiritual-primary"></div>
      </div>
    );
  }

  // Determine appropriate login route if unauthenticated: single universal login
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Verify role permission: redirect user to their own role's interface if access is denied
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user)} replace />;
  }

  // If Temple Authority has mustChangePassword === true, restrict navigation to change-password/settings
  if (
    user.role === USER_ROLES.TEMPLE_AUTHORITY &&
    user.mustChangePassword === true &&
    location.pathname !== ROUTES.AUTHORITY_SETTINGS &&
    location.pathname !== ROUTES.AUTHORITY_CHANGE_PASSWORD
  ) {
    return <Navigate to={ROUTES.AUTHORITY_SETTINGS} state={{ forcePasswordChange: true }} replace />;
  }

  return children;
};

export default RoleRoute;
