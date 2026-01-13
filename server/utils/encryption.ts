/**
 * Encryption Utilities for LLM API Keys
 * Uses AES-256-GCM for secure encryption with authentication
 */
import * as crypto from 'crypto';

// Constants
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const ENCRYPTED_PREFIX = 'enc:v1:';

// Fallback key for development (32 bytes)
const DEV_FALLBACK_KEY = Buffer.from(
  '00000000000000000000000000000000' + '00000000000000000000000000000001',
  'hex'
);

let warnedAboutFallbackKey = false;

/**
 * Get the encryption key from environment or use fallback
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.LLM_ENCRYPTION_KEY;

  if (envKey) {
    // Key should be 64 hex characters (32 bytes)
    if (envKey.length !== 64) {
      throw new Error('LLM_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    }
    return Buffer.from(envKey, 'hex');
  }

  // Use fallback key for development
  if (!warnedAboutFallbackKey) {
    console.warn(
      '[Encryption] LLM_ENCRYPTION_KEY not set. Using fallback key. ' +
        'This is insecure for production!'
    );
    warnedAboutFallbackKey = true;
  }

  return DEV_FALLBACK_KEY;
}

/**
 * Encrypt an API key using AES-256-GCM
 * @param plaintext - The API key to encrypt
 * @returns Encrypted string in format: enc:v1:iv:authTag:ciphertext (all base64)
 */
export function encryptApiKey(plaintext: string): string {
  if (plaintext === '') {
    // Handle empty string specially
    return `${ENCRYPTED_PREFIX}empty`;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: enc:v1:iv:authTag:ciphertext (all base64)
  return `${ENCRYPTED_PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted API key
 * @param encrypted - The encrypted string from encryptApiKey
 * @returns The original plaintext API key
 */
export function decryptApiKey(encrypted: string): string {
  if (!encrypted.startsWith(ENCRYPTED_PREFIX)) {
    throw new Error('Invalid encrypted format: missing prefix');
  }

  const content = encrypted.slice(ENCRYPTED_PREFIX.length);

  // Handle empty string special case
  if (content === 'empty') {
    return '';
  }

  const parts = content.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format: wrong number of parts');
  }

  const [ivBase64, authTagBase64, ciphertext] = parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  if (iv.length !== IV_LENGTH) {
    throw new Error('Invalid IV length');
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid auth tag length');
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask an API key for display purposes
 * Shows first 4 and last 4 characters with ... in between
 * @param apiKey - The API key to mask
 * @returns Masked string like "sk-1...cdef"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey) {
    return '';
  }

  const length = apiKey.length;

  // Very short keys get fully masked
  if (length <= 3) {
    return '***';
  }

  // Short keys (4-8 chars) show first and last
  if (length <= 8) {
    return `${apiKey[0]}...${apiKey[length - 1]}`;
  }

  // Standard keys show first 4 and last 4
  const prefix = apiKey.slice(0, 4);
  const suffix = apiKey.slice(-4);

  return `${prefix}...${suffix}`;
}

/**
 * Check if a string is already encrypted
 * @param value - The string to check
 * @returns true if the string appears to be encrypted
 */
export function isEncrypted(value: string): boolean {
  if (!value) {
    return false;
  }

  return value.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Safely encrypt a value, only if not already encrypted
 * @param value - The value to encrypt
 * @returns Encrypted value
 */
export function ensureEncrypted(value: string): string {
  if (isEncrypted(value)) {
    return value;
  }
  return encryptApiKey(value);
}

/**
 * Safely decrypt a value, only if encrypted
 * @param value - The value to decrypt
 * @returns Decrypted value or original if not encrypted
 */
export function ensureDecrypted(value: string): string {
  if (!isEncrypted(value)) {
    return value;
  }
  return decryptApiKey(value);
}
