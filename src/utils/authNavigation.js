import { ROUTES } from '../constants/routes.js';
import { USER_ROLES } from '../constants/roles.js';

/**
 * Returns the authoritative default landing route for an authenticated user role.
 * Fallback to /login if unauthenticated.
 */
export const getDefaultRouteForRole = (user) => {
  if (!user || !user.role) {
    return ROUTES.LOGIN;
  }

  switch (user.role) {
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;

    case USER_ROLES.TEMPLE_AUTHORITY:
      if (user.mustChangePassword) {
        return ROUTES.AUTHORITY_SETTINGS;
      }
      return ROUTES.AUTHORITY_DASHBOARD;

    case USER_ROLES.DEVOTEE:
      return ROUTES.DASHBOARD;

    default:
      return ROUTES.LOGIN;
  }
};
