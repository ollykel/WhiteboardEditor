/**
 * API types for profile updates (no password confirmation required)
 */

export interface UpdateProfileRequest {
  username?: string;
  profilePictureUrl?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  user: {
    id: string;
    username: string;
    profilePictureUrl?: string;
    updatedAt: string;
  };
  message: string;
}

export interface _UploadProfilePictureRequest {
  file: File;
}

export interface UploadProfilePictureResponse {
  success: boolean;
  profilePictureUrl: string;
  message: string;
}

export interface RemoveProfilePictureRequest {
  // No body needed, user ID comes from authentication
  // This interface is kept for future extensibility
  metadata?: Record<string, string>;
}

export interface RemoveProfilePictureResponse {
  success: boolean;
  message: string;
}

/**
 * Profile validation constraints
 */
export interface ProfileValidation {
  username: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
    reservedNames: string[];
  };
  profilePicture: {
    maxSizeBytes: number;
    allowedMimeTypes: string[];
    maxDimensions: {
      width: number;
      height: number;
    };
  };
}

export const PROFILE_VALIDATION: ProfileValidation = {
  username: {
    minLength: 3,
    maxLength: 30,
    allowedCharacters: /^[a-zA-Z0-9_-]+$/,
    reservedNames: ['admin', 'api', 'www', 'mail', 'support']
  },
  profilePicture: {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxDimensions: {
      width: 1024,
      height: 1024
    }
  }
};