import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import type { IUserFull } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRATION_SECS = parseInt(process.env.JWT_EXPIRATION_SECS || '');

if (! JWT_SECRET) {
  console.error('Missing required env var JWT_SECRET');
  process.exit(1);
}

if (! JWT_EXPIRATION_SECS) {
  console.error('Missing required env var JWT_EXPIRATION_SECS');
  process.exit(1);
}

export const loginService = async (
  authSource: 'email' | 'username',
  identifier: string,
  password: string,
) => {
  // Find user by email or username
  const user: IUserFull | null = await (async () => {
    switch (authSource) {
      case 'email':
        return await User.findOne({ email: identifier });
      case 'username':
        return await User.findOne({ username: identifier });
      default:
        return null;
    }
  })();

  if (!user) throw new Error("Invalid credentials, user not found");

  // Check password
  const valid = await bcrypt.compare(password, user.passwordHashed);
  if (!valid) throw new Error("Invalid credentials, incorrect password");

  // Sign JWT
  const token = jwt.sign(
    { sub: user._id.toString() },   // sub = subject claim
    JWT_SECRET, 
    {expiresIn: JWT_EXPIRATION_SECS},
  );

  return { token, user: { id: user._id, username: user.username, email: user.email } };
}