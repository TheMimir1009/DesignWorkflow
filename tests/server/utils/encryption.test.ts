/**
 * Encryption Utility Tests
 * TDD test suite for API key encryption/decryption
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  encryptApiKey,
  decryptApiKey,
  maskApiKey,
  isEncrypted,
} from '../../../server/utils/encryption';

describe('Encryption Utilities', () => {
  const originalEnv = process.env.LLM_ENCRYPTION_KEY;

  beforeEach(() => {
    // Set a test encryption key (32 bytes in hex = 64 characters)
    process.env.LLM_ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.LLM_ENCRYPTION_KEY = originalEnv;
    } else {
      delete process.env.LLM_ENCRYPTION_KEY;
    }
  });

  describe('encryptApiKey', () => {
    it('should encrypt a plaintext API key', () => {
      const plaintext = 'sk-test-1234567890abcdef';
      const encrypted = encryptApiKey(plaintext);

      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should produce different ciphertext for same plaintext (due to random IV)', () => {
      const plaintext = 'sk-test-1234567890abcdef';
      const encrypted1 = encryptApiKey(plaintext);
      const encrypted2 = encryptApiKey(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const encrypted = encryptApiKey('');
      expect(encrypted).toBeDefined();
    });

    it('should handle special characters', () => {
      const plaintext = 'sk-test-key!@#$%^&*()_+-={}[]|:;<>?,./~`';
      const encrypted = encryptApiKey(plaintext);

      expect(encrypted).not.toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = 'key-with-한글-日本語-emoji-🔑';
      const encrypted = encryptApiKey(plaintext);

      expect(encrypted).not.toBe(plaintext);
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt encrypted API key back to original', () => {
      const plaintext = 'sk-test-1234567890abcdef';
      const encrypted = encryptApiKey(plaintext);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty string encryption', () => {
      const encrypted = encryptApiKey('');
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle special characters', () => {
      const plaintext = 'sk-test-key!@#$%^&*()_+-={}[]|:;<>?,./~`';
      const encrypted = encryptApiKey(plaintext);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = 'key-with-한글-日本語-emoji-🔑';
      const encrypted = encryptApiKey(plaintext);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error for invalid encrypted string', () => {
      expect(() => decryptApiKey('invalid-encrypted-string')).toThrow();
    });

    it('should throw error for tampered ciphertext', () => {
      const plaintext = 'sk-test-1234567890abcdef';
      const encrypted = encryptApiKey(plaintext);
      // Tamper with the encrypted string
      const tampered = encrypted.slice(0, -4) + 'xxxx';

      expect(() => decryptApiKey(tampered)).toThrow();
    });
  });

  describe('maskApiKey', () => {
    it('should mask OpenAI API key format', () => {
      const apiKey = 'sk-proj-1234567890abcdefghijklmn';
      const masked = maskApiKey(apiKey);

      expect(masked).toBe('sk-p...klmn');
    });

    it('should mask Google API key format', () => {
      const apiKey = 'AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345678';
      const masked = maskApiKey(apiKey);

      expect(masked).toBe('AIza...5678');
    });

    it('should mask short API keys', () => {
      const apiKey = 'short';
      const masked = maskApiKey(apiKey);

      expect(masked).toBe('s...t');
    });

    it('should handle very short keys (3 characters or less)', () => {
      expect(maskApiKey('abc')).toBe('***');
      expect(maskApiKey('ab')).toBe('***');
      expect(maskApiKey('a')).toBe('***');
    });

    it('should handle empty string', () => {
      expect(maskApiKey('')).toBe('');
    });

    it('should show first 4 and last 4 characters for long keys', () => {
      const apiKey = 'sk-1234567890abcdefghij1234567890abcdef';
      const masked = maskApiKey(apiKey);

      expect(masked.startsWith('sk-1')).toBe(true);
      expect(masked.endsWith('cdef')).toBe(true);
      expect(masked.includes('...')).toBe(true);
    });
  });

  describe('isEncrypted', () => {
    it('should return true for encrypted strings', () => {
      const plaintext = 'sk-test-1234567890abcdef';
      const encrypted = encryptApiKey(plaintext);

      expect(isEncrypted(encrypted)).toBe(true);
    });

    it('should return false for plain API keys', () => {
      expect(isEncrypted('sk-test-1234567890abcdef')).toBe(false);
      expect(isEncrypted('AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz12345678')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isEncrypted('')).toBe(false);
    });
  });

  describe('Environment Key Handling', () => {
    it('should work with valid 32-byte hex key', () => {
      process.env.LLM_ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes in hex
      const plaintext = 'test-key';

      const encrypted = encryptApiKey(plaintext);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should use fallback key when env not set (with warning)', () => {
      delete process.env.LLM_ENCRYPTION_KEY;
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const plaintext = 'test-key';
      const encrypted = encryptApiKey(plaintext);
      const decrypted = decryptApiKey(encrypted);

      expect(decrypted).toBe(plaintext);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
