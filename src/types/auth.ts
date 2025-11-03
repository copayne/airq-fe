export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: 'admin' | 'user' | 'viewer';
  isActive: boolean;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface AuthPayload {
  user: User;
  token: string;
  success: boolean;
  message: string;
}

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthFormData {
  usernameOrEmail?: string;
  username?: string;
  email?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: AuthError[];
}

export type AuthFormType = 'login' | 'register';

export interface EmailVerificationInput {
  token: string;
}

export interface PasswordResetRequestInput {
  email: string;
}

export interface PasswordResetInput {
  token: string;
  newPassword: string;
}

export interface LogoutInput {
  token: string;
}

export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetFormData {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface EmailVerificationStatus {
  isVerified: boolean;
  canResend: boolean;
  lastSentAt?: Date;
}