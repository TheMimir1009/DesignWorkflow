/**
 * Authentication Middleware
 * JWT token verification for protected routes
 */
import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/tokenManager';

/**
 * Middleware to authenticate JWT token from Authorization header
 * Token format: "Bearer <token>"
 *
 * On success: attaches decoded payload to req.user and calls next()
 * On failure: returns 401 with appropriate error message
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists
  if (!authHeader) {
    res.status(401).json({
      success: false,
      data: null,
      error: 'No token provided',
    });
    return;
  }

  // Check for Bearer prefix (case-insensitive)
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({
      success: false,
      data: null,
      error: 'Invalid token format',
    });
    return;
  }

  // Extract token (handle extra spaces)
  const token = authHeader.slice(7).trim();

  // Verify token
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      data: null,
      error: 'Invalid or expired token',
    });
    return;
  }

  // Attach user payload to request
  req.user = payload;
  next();
}
