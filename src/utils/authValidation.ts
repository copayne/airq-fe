import type { AuthFormData, AuthError, ValidationResult } from '~/types/auth';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateUsername(username: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be no more than 30 characters long');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateLoginForm(data: AuthFormData): ValidationResult {
  const errors: AuthError[] = [];
  
  // Validate username/email field
  if (!data.usernameOrEmail?.trim()) {
    errors.push({
      field: 'usernameOrEmail',
      message: 'Username or email is required'
    });
  }
  
  // Validate password
  if (!data.password?.trim()) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRegisterForm(data: AuthFormData): ValidationResult {
  const errors: AuthError[] = [];
  
  // Validate username
  if (!data.username?.trim()) {
    errors.push({
      field: 'username',
      message: 'Username is required'
    });
  } else {
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.isValid) {
      usernameValidation.errors.forEach(error => {
        errors.push({
          field: 'username',
          message: error
        });
      });
    }
  }
  
  // Validate email
  if (!data.email?.trim()) {
    errors.push({
      field: 'email',
      message: 'Email is required'
    });
  } else if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address'
    });
  }
  
  // Validate password
  if (!data.password?.trim()) {
    errors.push({
      field: 'password',
      message: 'Password is required'
    });
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      passwordValidation.errors.forEach(error => {
        errors.push({
          field: 'password',
          message: error
        });
      });
    }
  }
  
  // Validate confirm password
  if (!data.confirmPassword?.trim()) {
    errors.push({
      field: 'confirmPassword',
      message: 'Please confirm your password'
    });
  } else if (data.password !== data.confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match'
    });
  }
  
  // Validate first name (optional but if provided, should be valid)
  if (data.firstName && data.firstName.trim().length > 100) {
    errors.push({
      field: 'firstName',
      message: 'First name must be no more than 100 characters'
    });
  }
  
  // Validate last name (optional but if provided, should be valid)
  if (data.lastName && data.lastName.trim().length > 100) {
    errors.push({
      field: 'lastName',
      message: 'Last name must be no more than 100 characters'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getFieldError(errors: AuthError[], fieldName: string): string | undefined {
  const fieldError = errors.find(error => error.field === fieldName);
  return fieldError?.message;
}

export function hasFieldError(errors: AuthError[], fieldName: string): boolean {
  return errors.some(error => error.field === fieldName);
}