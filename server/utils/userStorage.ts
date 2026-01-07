/**
 * User Storage Utilities
 * File system operations for user persistence with bcrypt password hashing
 */
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import type { User, RegisterUserDto } from '../types/auth';

// Bcrypt salt rounds (12 as per security requirements)
const SALT_ROUNDS = 12;

// Storage paths
export const USERS_DIR_PATH = path.join(process.cwd(), 'workspace/users');
export const USERS_FILE_PATH = path.join(USERS_DIR_PATH, 'users.json');

/**
 * Ensure users directory exists
 */
async function ensureUsersDirectoryExists(): Promise<void> {
  await fs.mkdir(USERS_DIR_PATH, { recursive: true });
}

/**
 * Read all users from storage
 */
async function readUsersFromStorage(): Promise<User[]> {
  try {
    await ensureUsersDirectoryExists();
    const content = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(content) as User[];
  } catch {
    return [];
  }
}

/**
 * Write all users to storage
 */
async function writeUsersToStorage(users: User[]): Promise<void> {
  await ensureUsersDirectoryExists();
  await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

/**
 * Get all users from storage
 * @returns Array of all users
 */
export async function getAllUsers(): Promise<User[]> {
  return readUsersFromStorage();
}

/**
 * Get user by ID
 * @param id - User UUID
 * @returns User if found, null otherwise
 */
export async function getUserById(id: string): Promise<User | null> {
  const users = await readUsersFromStorage();
  return users.find(u => u.id === id) || null;
}

/**
 * Get user by email (case-insensitive)
 * @param email - User email
 * @returns User if found, null otherwise
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await readUsersFromStorage();
  const normalizedEmail = email.toLowerCase().trim();
  return users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
}

/**
 * Create a new user with hashed password
 * @param userData - User registration data
 * @returns Created user
 */
export async function createUser(userData: RegisterUserDto): Promise<User> {
  const users = await readUsersFromStorage();

  // Hash password with bcrypt (12 salt rounds)
  const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

  const now = new Date().toISOString();
  const user: User = {
    id: uuidv4(),
    email: userData.email.toLowerCase().trim(),
    passwordHash,
    name: userData.name.trim(),
    role: 'user',
    createdAt: now,
    updatedAt: now,
  };

  users.push(user);
  await writeUsersToStorage(users);

  return user;
}

/**
 * Update user data
 * @param id - User UUID
 * @param userData - Fields to update
 * @returns Updated user if found, null otherwise
 */
export async function updateUser(
  id: string,
  userData: { name?: string; email?: string; password?: string }
): Promise<User | null> {
  const users = await readUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return null;
  }

  const existingUser = users[userIndex];
  const now = new Date().toISOString();

  // Build updated user
  const updatedUser: User = {
    ...existingUser,
    name: userData.name !== undefined ? userData.name.trim() : existingUser.name,
    email: userData.email !== undefined ? userData.email.toLowerCase().trim() : existingUser.email,
    updatedAt: now,
  };

  // Hash new password if provided
  if (userData.password !== undefined) {
    updatedUser.passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
  }

  users[userIndex] = updatedUser;
  await writeUsersToStorage(users);

  return updatedUser;
}

/**
 * Delete user by ID
 * @param id - User UUID
 * @returns true if deleted, false if not found
 */
export async function deleteUser(id: string): Promise<boolean> {
  const users = await readUsersFromStorage();
  const initialLength = users.length;
  const filteredUsers = users.filter(u => u.id !== id);

  if (filteredUsers.length === initialLength) {
    return false;
  }

  await writeUsersToStorage(filteredUsers);
  return true;
}
