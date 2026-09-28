import { ROUTES, type AppRoute } from '../constants/routes.js';
import { USER_ROLES, type UserRole } from '../constants/roles.js';
import type { User } from '@shared/types/index.js';

export interface AuthNavUser {
  role?: UserRole | string | null;
  mustChangePassword?: boolean;
}

/**
 * Returns the authoritative default landing route for an authenticated user role.
 * Fallback to /login if unauthenticated.
 */
export const getDefaultRouteForRole = (user?: AuthNavUser | User | null): AppRoute => {
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

export default getDefaultRouteForRole;
