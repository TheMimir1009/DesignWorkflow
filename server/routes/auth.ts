/**
 * Authentication Routes
 * Handles user registration, login, logout, and profile
 */
import { Router, type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import {
  getUserByEmail,
  getUserById,
  createUser,
} from '../utils/userStorage';
import { generateToken } from '../utils/tokenManager';
import { authenticateToken } from '../middleware/authMiddleware';
import { sendSuccess, sendError } from '../utils/response';
import type {
  RegisterUserDto,
  LoginDto,
  SafeUser,
  LoginResponse,
  LogoutResponse,
  User,
} from '../types/auth';

export const authRouter = Router();

/**
 * Convert User to SafeUser (remove sensitive data)
 */
function toSafeUser(user: User): SafeUser {
  const { passwordHash: _hash, ...safeUser } = user;
  void _hash; // Explicitly mark as unused
  return safeUser;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * - Minimum 8 characters
 * - Must contain at least one letter
 * - Must contain at least one number
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
 * POST /api/auth/register - Register a new user
 *
 * Request Body:
 * - email: string (required, valid email format)
 * - password: string (required, min 8 chars, letters + numbers)
 * - name: string (required)
 *
 * Response:
 * - 201: User created successfully (SafeUser)
 * - 400: Validation error
 * - 409: Email already exists
 * - 500: Server error
 */
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as RegisterUserDto;

    // Validate required fields
    if (!body.email) {
      sendError(res, 400, 'email is required');
      return;
    }
    if (!body.password) {
      sendError(res, 400, 'password is required');
      return;
    }
    if (!body.name) {
      sendError(res, 400, 'name is required');
      return;
    }

    // Validate email format
    if (!isValidEmail(body.email)) {
      sendError(res, 400, 'Invalid email format');
      return;
    }

    // Validate password strength
    const passwordValidation = isValidPassword(body.password);
    if (!passwordValidation.valid) {
      sendError(res, 400, passwordValidation.error!);
      return;
    }

    // Check for existing user
    const existingUser = await getUserByEmail(body.email);
    if (existingUser) {
      sendError(res, 409, 'Email already exists');
      return;
    }

    // Create user
    const user = await createUser({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    sendSuccess(res, toSafeUser(user), 201);
  } catch (error) {
    console.error('Error registering user:', error);
    sendError(res, 500, 'Failed to register user');
  }
});

/**
 * POST /api/auth/login - Login user
 *
 * Request Body:
 * - email: string (required)
 * - password: string (required)
 *
 * Response:
 * - 200: Login successful ({ user: SafeUser, token: string })
 * - 400: Missing fields
 * - 401: Invalid credentials
 * - 500: Server error
 */
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as LoginDto;

    // Validate required fields
    if (!body.email) {
      sendError(res, 400, 'email is required');
      return;
    }
    if (!body.password) {
      sendError(res, 400, 'password is required');
      return;
    }

    // Find user by email
    const user = await getUserByEmail(body.email);
    if (!user) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      sendError(res, 401, 'Invalid email or password');
      return;
    }

    // Generate token
    const token = generateToken(user);

    const response: LoginResponse = {
      user: toSafeUser(user),
      token,
    };

    sendSuccess(res, response);
  } catch (error) {
    console.error('Error logging in:', error);
    sendError(res, 500, 'Failed to login');
  }
});

/**
 * POST /api/auth/logout - Logout user (requires authentication)
 *
 * Response:
 * - 200: Logout successful
 * - 401: Not authenticated
 */
authRouter.post('/logout', authenticateToken, (_req: Request, res: Response): void => {
  const response: LogoutResponse = {
    message: 'Logged out successfully',
  };
  sendSuccess(res, response);
});

/**
 * GET /api/auth/me - Get current user profile (requires authentication)
 *
 * Response:
 * - 200: Current user info (SafeUser)
 * - 401: Not authenticated
 * - 404: User not found
 * - 500: Server error
 */
authRouter.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 401, 'Not authenticated');
      return;
    }

    const user = await getUserById(userId);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, toSafeUser(user));
  } catch (error) {
    console.error('Error getting user profile:', error);
    sendError(res, 500, 'Failed to get user profile');
  }
});
