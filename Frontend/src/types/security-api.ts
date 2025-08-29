/**
 * API types for security updates (password confirmation required)
 */

export interface UpdateSecurityRequest {
  currentPassword: string;
  email?: string;
  newPassword?: string;
}

export interface UpdateSecurityResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    updatedAt: string;
  };
  message: string;
  requiresEmailVerification?: boolean;
}

export interface ChangeEmailRequest {
  currentPassword: string;
  newEmail: string;
}

export interface ChangeEmailResponse {
  success: boolean;
  message: string;
  requiresVerification: boolean;
  verificationEmailSent: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  passwordChangedAt: string;
}

export interface VerifyCurrentPasswordRequest {
  currentPassword: string;
}

export interface VerifyCurrentPasswordResponse {
  success: boolean;
  valid: boolean;
  message: string;
}

export interface DeleteAccountRequest {
  currentPassword: string;
  confirmDeletion: boolean;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletedAt: string;
}

/**
 * Security validation constraints
 */
export interface SecurityValidation {
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialChars: string;
  };
  email: {
    maxLength: number;
    validationRegex: RegExp;
  };
}

export const SECURITY_VALIDATION: SecurityValidation = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  },
  email: {
    maxLength: 254,
    validationRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};