/**
 * Core user data types
 */

export interface User {
  id: string;
  email: string;
  username: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  lastLoginAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  profilePictureUrl?: string;
  updatedAt: string;
}

export interface UserSecurity {
  id: string;
  email: string;
  emailVerified: boolean;
  lastPasswordChange?: string;
  twoFactorEnabled: boolean;
}