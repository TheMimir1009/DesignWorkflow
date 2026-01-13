/**
 * User Management Routes
 * Admin endpoints for user CRUD operations
 */
import { Router, type Request, type Response } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../utils/userStorage';
import { authenticateToken } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/response';
import type { User, SafeUser, UpdateUserDto } from '../types/auth';

export const usersRouter = Router();

/**
 * Convert User to SafeUser (remove sensitive data)
 */
function toSafeUser(user: User): SafeUser {
  const { passwordHash: _hash, ...safeUser } = user;
  void _hash; // Explicitly mark as unused
  return safeUser;
}

/**
 * Validate password strength
 */
function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

/**
 * POST /api/users/make-admin - Make a user admin (first user only, or existing admin)
 * This is a helper endpoint for testing - in production, use proper admin seeding
 */
usersRouter.post('/make-admin', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const requestingUser = await getUserById(req.user!.userId);

    // Allow if no admin exists yet, or if requesting user is admin
    const allUsers = await getAllUsers();
    const adminExists = allUsers.some(u => u.role === 'admin');

    if (adminExists && requestingUser?.role !== 'admin') {
      sendError(res, 403, 'Only admins can promote users to admin');
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    // Direct update of role (normally this would be more controlled)
    const allUsersData = await getAllUsers();
    const userIndex = allUsersData.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      allUsersData[userIndex].role = 'admin';
      allUsersData[userIndex].updatedAt = new Date().toISOString();

      // Write back to storage
      const fs = await import('fs/promises');
      const path = await import('path');
      const USERS_FILE_PATH = path.join(process.cwd(), 'workspace/users/users.json');
      await fs.writeFile(USERS_FILE_PATH, JSON.stringify(allUsersData, null, 2), 'utf-8');
    }

    sendSuccess(res, { message: 'User promoted to admin' });
  } catch (error) {
    console.error('Error making admin:', error);
    sendError(res, 500, 'Failed to make admin');
  }
});

/**
 * GET /api/users - Get all users (admin only)
 *
 * Response:
 * - 200: List of all users (SafeUser[])
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 * - 500: Server error
 */
usersRouter.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      sendError(res, 403, 'Admin access required');
      return;
    }

    const users = await getAllUsers();
    const safeUsers = users.map(toSafeUser);
    sendSuccess(res, safeUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    sendError(res, 500, 'Failed to get users');
  }
});

/**
 * PUT /api/users/:userId - Update user (admin or self)
 *
 * Request Body:
 * - name?: string
 * - email?: string
 * - password?: string
 *
 * Response:
 * - 200: User updated (SafeUser)
 * - 400: Validation error
 * - 401: Not authenticated
 * - 403: Not authorized
 * - 404: User not found
 * - 500: Server error
 */
usersRouter.put('/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const body = req.body as UpdateUserDto;

    // Check authorization: admin can update anyone, users can only update themselves
    const isAdmin = req.user?.role === 'admin';
    const isSelf = req.user?.userId === userId;

    if (!isAdmin && !isSelf) {
      sendError(res, 403, 'You can only update your own profile');
      return;
    }

    // Check if user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      sendError(res, 404, 'User not found');
      return;
    }

    // Validate password if provided
    if (body.password) {
      const passwordValidation = isValidPassword(body.password);
      if (!passwordValidation.valid) {
        sendError(res, 400, passwordValidation.error!);
        return;
      }
    }

    // Update user
    const updatedUser = await updateUser(userId, body);
    if (!updatedUser) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, toSafeUser(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    sendError(res, 500, 'Failed to update user');
  }
});

/**
 * DELETE /api/users/:userId - Delete user (admin only)
 *
 * Response:
 * - 204: User deleted
 * - 400: Cannot delete self
 * - 401: Not authenticated
 * - 403: Not authorized (not admin)
 * - 404: User not found
 * - 500: Server error
 */
usersRouter.delete('/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Check admin role
    if (req.user?.role !== 'admin') {
      sendError(res, 403, 'Admin access required');
      return;
    }

    // Prevent self-deletion
    if (req.user.userId === userId) {
      sendError(res, 400, 'Cannot delete your own account');
      return;
    }

    // Check if user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      sendError(res, 404, 'User not found');
      return;
    }

    // Delete user
    const deleted = await deleteUser(userId);
    if (!deleted) {
      sendError(res, 404, 'User not found');
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    sendError(res, 500, 'Failed to delete user');
  }
});
