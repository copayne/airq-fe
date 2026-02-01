import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateLoginForm,
  validateRegisterForm,
  getFieldError,
  hasFieldError,
} from '../authValidation';
import type { AuthFormData } from '~/types/auth';

describe('validateEmail', () => {
  const valid = ['user@example.com', 'a@b.co', 'foo+bar@baz.org'];
  const invalid = ['', 'no-at-sign', '@missing-local.com', 'missing@.com', 'spaces in@email.com'];

  it.each(valid)('accepts %s', (email) => {
    expect(validateEmail(email)).toBe(true);
  });

  it.each(invalid)('rejects %s', (email) => {
    expect(validateEmail(email)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  const cases: { input: string; missing: string }[] = [
    { input: 'Short1!', missing: 'at least 8 characters' },
    { input: 'alllowercase1!', missing: 'uppercase' },
    { input: 'ALLUPPERCASE1!', missing: 'lowercase' },
    { input: 'NoDigits!!aa', missing: 'number' },
    { input: 'NoSpecial1aa', missing: 'special character' },
  ];

  it.each(cases)('rejects "$input" (missing $missing)', ({ input, missing }) => {
    const result = validatePassword(input);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes(missing))).toBe(true);
  });

  it('returns multiple errors for a very weak password', () => {
    const result = validatePassword('ab');
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('validateUsername', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('alice').isValid).toBe(true);
    expect(validateUsername('user_name-123').isValid).toBe(true);
    expect(validateUsername('abc').isValid).toBe(true);
  });

  it('rejects too short', () => {
    const result = validateUsername('ab');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('at least 3');
  });

  it('rejects too long', () => {
    const result = validateUsername('a'.repeat(31));
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('no more than 30');
  });

  it('rejects special characters', () => {
    const result = validateUsername('user@name');
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('letters, numbers, underscores, and hyphens');
  });
});

describe('validateLoginForm', () => {
  it('passes with valid data', () => {
    const data: AuthFormData = { usernameOrEmail: 'user', password: 'pass' };
    const result = validateLoginForm(data);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when usernameOrEmail is empty', () => {
    const data: AuthFormData = { usernameOrEmail: '', password: 'pass' };
    const result = validateLoginForm(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'usernameOrEmail')).toBe(true);
  });

  it('fails when password is empty', () => {
    const data: AuthFormData = { usernameOrEmail: 'user', password: '' };
    const result = validateLoginForm(data);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('fails when both fields empty', () => {
    const data: AuthFormData = { usernameOrEmail: '', password: '' };
    const result = validateLoginForm(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});

describe('validateRegisterForm', () => {
  const validData: AuthFormData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'StrongP@ss1',
    confirmPassword: 'StrongP@ss1',
  };

  it('passes with valid data', () => {
    expect(validateRegisterForm(validData).isValid).toBe(true);
  });

  it('fails on missing username', () => {
    const result = validateRegisterForm({ ...validData, username: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'username')).toBe(true);
  });

  it('fails on invalid email', () => {
    const result = validateRegisterForm({ ...validData, email: 'bad' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('fails on weak password', () => {
    const result = validateRegisterForm({ ...validData, password: 'weak', confirmPassword: 'weak' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('fails on mismatched confirmPassword', () => {
    const result = validateRegisterForm({ ...validData, confirmPassword: 'Different1!' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'confirmPassword')).toBe(true);
  });

  it('fails on overly long firstName', () => {
    const result = validateRegisterForm({ ...validData, firstName: 'a'.repeat(101) });
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === 'firstName')).toBe(true);
  });
});

describe('getFieldError / hasFieldError', () => {
  const errors = [
    { field: 'email', message: 'Invalid email' },
    { field: 'password', message: 'Too short' },
  ];

  it('getFieldError returns the message for a matching field', () => {
    expect(getFieldError(errors, 'email')).toBe('Invalid email');
  });

  it('getFieldError returns undefined for a non-matching field', () => {
    expect(getFieldError(errors, 'username')).toBeUndefined();
  });

  it('hasFieldError returns true for existing field', () => {
    expect(hasFieldError(errors, 'password')).toBe(true);
  });

  it('hasFieldError returns false for non-existing field', () => {
    expect(hasFieldError(errors, 'firstName')).toBe(false);
  });
});
