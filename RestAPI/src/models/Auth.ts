interface BaseAuthRequest {
  password: string;
}

export interface EmailAuthRequest extends BaseAuthRequest {
  authSource: 'email';
  email: string;
}

export interface UsernameAuthRequest extends BaseAuthRequest {
  authSource: 'username';
  username: string;
}

export type AuthRequest = EmailAuthRequest | UsernameAuthRequest;
