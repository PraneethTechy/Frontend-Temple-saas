import { USER_ROLES as SHARED_USER_ROLES, type UserRole, ALL_ROLES } from '@shared/types/index.js';

/**
 * Authoritative user roles for DevaSetu client application.
 * Directly re-exports shared canonical role contracts from @shared/types.
 */
export const USER_ROLES = SHARED_USER_ROLES;

export type { UserRole };
export { ALL_ROLES };

export default USER_ROLES;
