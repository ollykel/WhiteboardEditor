/**
 * Main types export file
 * Import from here to get all API and data types
 */

// User data types
export * from './user';

// API request/response types
export * from './profile-api';
export * from './security-api';
export * from './api-common';
export * from './api-endpoints';

// Re-export common types for convenience
export type {
  // Core user types
  User,
  UserProfile,
  UserSecurity,

  // Profile API types
  UpdateProfileRequest,
  UpdateProfileResponse,
  UploadProfilePictureRequest,
  UploadProfilePictureResponse,
  RemoveProfilePictureResponse,

  // Security API types
  UpdateSecurityRequest,
  UpdateSecurityResponse,
  ChangeEmailRequest,
  ChangeEmailResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyCurrentPasswordRequest,
  VerifyCurrentPasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,

  // Common API types
  ApiResponse,
  ApiError,
  ValidationError,
  ApiClient,

  // Endpoint definitions
  ApiEndpoints,
  ProfileEndpoints,
  SecurityEndpoints,
  AccountEndpoints
} from './user';

// Re-export constants
export {
  PROFILE_VALIDATION,
  SECURITY_VALIDATION,
  ApiErrorCode,
  HttpStatus,
  API_ENDPOINTS,
  API_METHODS
} from './profile-api';