/**
 * Role-based Middleware
 * User role and project permission validation middleware
 */
import type { Request, Response, NextFunction } from 'express';
import { getUserProjectAccess } from '../utils/accessStorage';
import type { UserRole, ProjectRole } from '../types/auth';

/**
 * Role hierarchy for project access
 * Higher index = more permissions
 */
const PROJECT_ROLE_HIERARCHY: ProjectRole[] = ['viewer', 'editor', 'owner'];

/**
 * Check if a role has at least the required level
 */
function hasMinimumProjectRole(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
  const userRoleIndex = PROJECT_ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = PROJECT_ROLE_HIERARCHY.indexOf(requiredRole);
  return userRoleIndex >= requiredRoleIndex;
}

/**
 * Middleware to require specific user roles
 * Checks the user's system role (admin, user)
 *
 * @param roles - Required roles (any match grants access)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        error: 'Authentication required',
      });
      return;
    }

    // Check role
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        data: null,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to require specific project roles
 * Checks the user's access level for a specific project
 * System admins bypass project role checks
 *
 * @param roles - Required project roles (any match grants access)
 */
export function requireProjectRole(...roles: ProjectRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check authentication
    if (!req.user) {
      res.status(401).json({
        success: false,
        data: null,
        error: 'Authentication required',
      });
      return;
    }

    // System admins bypass project role checks
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Get project ID from params
    const projectId = req.params.projectId;
    if (!projectId) {
      res.status(400).json({
        success: false,
        data: null,
        error: 'Project ID is required',
      });
      return;
    }

    // Get user's project access
    const access = await getUserProjectAccess(projectId, req.user.userId);

    if (!access) {
      res.status(403).json({
        success: false,
        data: null,
        error: 'Insufficient project permissions',
      });
      return;
    }

    // Check if user has any of the required roles
    // Use hierarchy to allow higher roles to access lower role requirements
    const hasRequiredRole = roles.some(requiredRole =>
      hasMinimumProjectRole(access.role, requiredRole)
    );

    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        data: null,
        error: 'Insufficient project permissions',
      });
      return;
    }

    next();
  };
}
