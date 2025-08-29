/**
 * API endpoint definitions with complete request/response typing
 */

import { 
  UpdateProfileRequest, 
  UpdateProfileResponse,
  UploadProfilePictureResponse,
  RemoveProfilePictureResponse
} from './profile-api';

import {
  UpdateSecurityRequest,
  UpdateSecurityResponse,
  ChangeEmailRequest,
  ChangeEmailResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  VerifyCurrentPasswordRequest,
  VerifyCurrentPasswordResponse,
  DeleteAccountRequest,
  DeleteAccountResponse
} from './security-api';

import { User, UserProfile, UserSecurity } from './user';
import { ApiResponse, ErrorResponse } from './api-common';

/**
 * Profile Management Endpoints
 */
export interface ProfileEndpoints {
  // GET /api/profile
  getProfile: {
    request: void;
    response: ApiResponse<UserProfile> | ErrorResponse;
  };

  // PATCH /api/profile
  updateProfile: {
    request: UpdateProfileRequest;
    response: UpdateProfileResponse | ErrorResponse;
  };

  // POST /api/profile/picture
  uploadProfilePicture: {
    request: FormData; // Contains the file
    response: UploadProfilePictureResponse | ErrorResponse;
  };

  // DELETE /api/profile/picture
  removeProfilePicture: {
    request: void;
    response: RemoveProfilePictureResponse | ErrorResponse;
  };
}

/**
 * Security Management Endpoints
 */
export interface SecurityEndpoints {
  // GET /api/security
  getSecurityInfo: {
    request: void;
    response: ApiResponse<UserSecurity> | ErrorResponse;
  };

  // PATCH /api/security
  updateSecurity: {
    request: UpdateSecurityRequest;
    response: UpdateSecurityResponse | ErrorResponse;
  };

  // POST /api/security/verify-password
  verifyPassword: {
    request: VerifyCurrentPasswordRequest;
    response: VerifyCurrentPasswordResponse | ErrorResponse;
  };

  // PATCH /api/security/email
  changeEmail: {
    request: ChangeEmailRequest;
    response: ChangeEmailResponse | ErrorResponse;
  };

  // PATCH /api/security/password
  changePassword: {
    request: ChangePasswordRequest;
    response: ChangePasswordResponse | ErrorResponse;
  };
}

/**
 * Account Management Endpoints
 */
export interface AccountEndpoints {
  // GET /api/account
  getAccount: {
    request: void;
    response: ApiResponse<User> | ErrorResponse;
  };

  // DELETE /api/account
  deleteAccount: {
    request: DeleteAccountRequest;
    response: DeleteAccountResponse | ErrorResponse;
  };
}

/**
 * Complete API interface
 */
export interface ApiEndpoints extends ProfileEndpoints, SecurityEndpoints, AccountEndpoints {}

/**
 * API client method signatures
 */
export interface ApiClient {
  // Profile methods
  getProfile(): Promise<ApiResponse<UserProfile>>;
  updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse>;
  uploadProfilePicture(file: File): Promise<UploadProfilePictureResponse>;
  removeProfilePicture(): Promise<RemoveProfilePictureResponse>;

  // Security methods
  getSecurityInfo(): Promise<ApiResponse<UserSecurity>>;
  updateSecurity(data: UpdateSecurityRequest): Promise<UpdateSecurityResponse>;
  verifyPassword(password: string): Promise<VerifyCurrentPasswordResponse>;
  changeEmail(data: ChangeEmailRequest): Promise<ChangeEmailResponse>;
  changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse>;

  // Account methods
  getAccount(): Promise<ApiResponse<User>>;
  deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse>;
}

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  PROFILE: '/api/profile',
  PROFILE_PICTURE: '/api/profile/picture',
  SECURITY: '/api/security',
  VERIFY_PASSWORD: '/api/security/verify-password',
  CHANGE_EMAIL: '/api/security/email',
  CHANGE_PASSWORD: '/api/security/password',
  ACCOUNT: '/api/account'
} as const;

/**
 * HTTP methods for each endpoint
 */
export const API_METHODS = {
  [API_ENDPOINTS.PROFILE]: {
    GET: 'getProfile',
    PATCH: 'updateProfile'
  },
  [API_ENDPOINTS.PROFILE_PICTURE]: {
    POST: 'uploadProfilePicture',
    DELETE: 'removeProfilePicture'
  },
  [API_ENDPOINTS.SECURITY]: {
    GET: 'getSecurityInfo',
    PATCH: 'updateSecurity'
  },
  [API_ENDPOINTS.VERIFY_PASSWORD]: {
    POST: 'verifyPassword'
  },
  [API_ENDPOINTS.CHANGE_EMAIL]: {
    PATCH: 'changeEmail'
  },
  [API_ENDPOINTS.CHANGE_PASSWORD]: {
    PATCH: 'changePassword'
  },
  [API_ENDPOINTS.ACCOUNT]: {
    GET: 'getAccount',
    DELETE: 'deleteAccount'
  }
} as const;