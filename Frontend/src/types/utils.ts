/**
 * Utility functions for working with API types
 */

import { 
  ApiResponse, 
  ApiError, 
  ValidationError, 
  ApiErrorCode,
  PROFILE_VALIDATION,
  SECURITY_VALIDATION
} from './index';

/**
 * Type guards
 */
export function isApiError(response: unknown): response is ApiError {
  return response && !response.success && response.error;
}

export function isApiSuccess<T>(response: unknown): response is ApiResponse<T> {
  return response && response.success === true;
}

export function isValidationError(error: ApiError): error is ApiError & {
  error: { code: ApiErrorCode.VALIDATION_ERROR; details: { fields: ValidationError[] } }
} {
  return error.error.code === ApiErrorCode.VALIDATION_ERROR;
}

/**
 * Validation helpers
 */
export function validateUsername(username: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const { minLength, maxLength, allowedCharacters, reservedNames } = PROFILE_VALIDATION.username;

  if (!username) {
    errors.push({
      field: 'username',
      code: 'REQUIRED',
      message: 'Username is required'
    });
    return errors;
  }

  if (username.length < minLength) {
    errors.push({
      field: 'username',
      code: 'TOO_SHORT',
      message: `Username must be at least ${minLength} characters long`,
      value: username.length
    });
  }

  if (username.length > maxLength) {
    errors.push({
      field: 'username',
      code: 'TOO_LONG',
      message: `Username must be no more than ${maxLength} characters long`,
      value: username.length
    });
  }

  if (!allowedCharacters.test(username)) {
    errors.push({
      field: 'username',
      code: 'INVALID_CHARACTERS',
      message: 'Username can only contain letters, numbers, hyphens, and underscores'
    });
  }

  if (reservedNames.includes(username.toLowerCase())) {
    errors.push({
      field: 'username',
      code: 'RESERVED_NAME',
      message: 'This username is reserved and cannot be used'
    });
  }

  return errors;
}

export function validateEmail(email: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const { maxLength, validationRegex } = SECURITY_VALIDATION.email;

  if (!email) {
    errors.push({
      field: 'email',
      code: 'REQUIRED',
      message: 'Email is required'
    });
    return errors;
  }

  if (email.length > maxLength) {
    errors.push({
      field: 'email',
      code: 'TOO_LONG',
      message: `Email must be no more than ${maxLength} characters long`,
      value: email.length
    });
  }

  if (!validationRegex.test(email)) {
    errors.push({
      field: 'email',
      code: 'INVALID_FORMAT',
      message: 'Please enter a valid email address'
    });
  }

  return errors;
}

export function validatePassword(password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const validation = SECURITY_VALIDATION.password;

  if (!password) {
    errors.push({
      field: 'password',
      code: 'REQUIRED',
      message: 'Password is required'
    });
    return errors;
  }

  if (password.length < validation.minLength) {
    errors.push({
      field: 'password',
      code: 'TOO_SHORT',
      message: `Password must be at least ${validation.minLength} characters long`,
      value: password.length
    });
  }

  if (validation.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      code: 'MISSING_UPPERCASE',
      message: 'Password must contain at least one uppercase letter'
    });
  }

  if (validation.requireLowercase && !/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      code: 'MISSING_LOWERCASE',
      message: 'Password must contain at least one lowercase letter'
    });
  }

  if (validation.requireNumbers && !/\d/.test(password)) {
    errors.push({
      field: 'password',
      code: 'MISSING_NUMBER',
      message: 'Password must contain at least one number'
    });
  }

  if (validation.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`[${validation.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharsRegex.test(password)) {
      errors.push({
        field: 'password',
        code: 'MISSING_SPECIAL_CHAR',
        message: `Password must contain at least one special character (${validation.specialChars})`
      });
    }
  }

  return errors;
}

export function validatePasswordConfirmation(password: string, confirmPassword: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      code: 'PASSWORD_MISMATCH',
      message: 'Passwords do not match'
    });
  }

  return errors;
}

export function validateProfilePicture(file: File): ValidationError[] {
  const errors: ValidationError[] = [];
  const { maxSizeBytes, allowedMimeTypes } = PROFILE_VALIDATION.profilePicture;

  if (file.size > maxSizeBytes) {
    errors.push({
      field: 'profilePicture',
      code: 'FILE_TOO_LARGE',
      message: `File size must be less than ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
      value: file.size
    });
  }

  if (!allowedMimeTypes.includes(file.type)) {
    errors.push({
      field: 'profilePicture',
      code: 'INVALID_FILE_TYPE',
      message: `File must be one of: ${allowedMimeTypes.join(', ')}`,
      value: file.type
    });
  }

  return errors;
}

/**
 * Error message extractors
 */
export function getErrorMessage(error: ApiError): string {
  if (isValidationError(error)) {
    return error.error.details.fields.map(f => f.message).join(', ');
  }
  return error.error.message || 'An unexpected error occurred';
}

export function getFieldErrors(error: ApiError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  
  if (isValidationError(error)) {
    error.error.details.fields.forEach(fieldError => {
      if (!fieldErrors[fieldError.field]) {
        fieldErrors[fieldError.field] = [];
      }
      fieldErrors[fieldError.field].push(fieldError.message);
    });
  }
  
  return fieldErrors;
}

/**
 * API response helpers
 */
export function createSuccessResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  };
}

export function createErrorResponse(code: ApiErrorCode, message: string, details?: Record<string, unknown>): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID()
  };
}