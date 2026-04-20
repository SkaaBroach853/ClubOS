/**
 * @file utils.test.js
 * @description Unit tests for ClubOS utility functions.
 * Tests input sanitization, localStorage helpers, and string utilities
 * used throughout the college club event management platform.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ─── SANITIZATION UTILITIES ──────────────────────────────────────────────────

/**
 * Sanitizes user input to prevent XSS attacks.
 * @param {string} input - Raw user input
 * @returns {string} Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Validates an event brief string.
 * @param {string} brief - Event brief text
 * @returns {{ valid: boolean, error: string | null }}
 */
const validateEventBrief = (brief) => {
  if (!brief || typeof brief !== 'string') return { valid: false, error: 'Brief is required' };
  const trimmed = brief.trim();
  if (trimmed.length < 10) return { valid: false, error: 'Brief must be at least 10 characters' };
  if (trimmed.length > 2000) return { valid: false, error: 'Brief must be under 2000 characters' };
  return { valid: true, error: null };
};

/**
 * Safely parses JSON from localStorage.
 * @param {string} key - LocalStorage key
 * @param {*} fallback - Default value if parse fails
 * @returns {*} Parsed value or fallback
 */
const safeLocalStorageGet = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
};

/**
 * Formats a number as Indian Rupees.
 * @param {number} amount - Amount in INR
 * @returns {string} Formatted currency string
 */
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// ─── SANITIZATION TESTS ──────────────────────────────────────────────────────

describe('sanitizeInput — XSS Prevention', () => {
  it('should sanitize HTML script tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
  });

  it('should encode angle brackets', () => {
    const result = sanitizeInput('<b>bold</b>');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(123)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

// ─── VALIDATION TESTS ────────────────────────────────────────────────────────

describe('validateEventBrief — Input Validation', () => {
  it('should accept valid event briefs', () => {
    const result = validateEventBrief('We are hosting a 24-hour hackathon for 200 students');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('should reject briefs shorter than 10 characters', () => {
    const result = validateEventBrief('short');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('10 characters');
  });

  it('should reject null or undefined input', () => {
    expect(validateEventBrief(null).valid).toBe(false);
    expect(validateEventBrief(undefined).valid).toBe(false);
  });

  it('should reject briefs over 2000 characters', () => {
    const longText = 'a'.repeat(2001);
    const result = validateEventBrief(longText);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('2000 characters');
  });

  it('should reject empty string', () => {
    expect(validateEventBrief('').valid).toBe(false);
  });
});

// ─── LOCALSTORAGE TESTS ──────────────────────────────────────────────────────

describe('safeLocalStorageGet — Safe Storage Access', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return fallback when key does not exist', () => {
    expect(safeLocalStorageGet('nonexistent', 'default')).toBe('default');
  });

  it('should parse valid JSON from localStorage', () => {
    localStorage.setItem('testKey', JSON.stringify({ apiKey: 'test123' }));
    const result = safeLocalStorageGet('testKey');
    expect(result).toEqual({ apiKey: 'test123' });
  });

  it('should return fallback when JSON is invalid', () => {
    localStorage.setItem('badJson', '{invalid}');
    const result = safeLocalStorageGet('badJson', null);
    expect(result).toBeNull();
  });

  it('should return null fallback by default', () => {
    expect(safeLocalStorageGet('missing')).toBeNull();
  });
});

// ─── FORMATTING TESTS ────────────────────────────────────────────────────────

describe('formatINR — Indian Currency Formatting', () => {
  it('should format large amounts correctly', () => {
    const result = formatINR(50000);
    expect(result).toContain('50,000');
  });

  it('should include rupee symbol', () => {
    const result = formatINR(1000);
    expect(result).toContain('₹');
  });

  it('should handle zero', () => {
    const result = formatINR(0);
    expect(result).toContain('0');
  });
});
