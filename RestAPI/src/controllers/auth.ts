import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User";

import type { IUserFull } from "../models/User";
import type { AuthRequest } from "../models/Auth";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION_SECS = parseInt(process.env.JWT_EXPIRATION_SECS || '');

if (! JWT_SECRET) {
  console.error('Missing required env var JWT_SECRET');
  process.exit(1);
}

if (! JWT_EXPIRATION_SECS) {
  console.error('Missing required env var JWT_EXPIRATION_SECS');
  process.exit(1);
}

export const login = async (req: Request<{}, {}, AuthRequest>, res: Response) => {
  try {
    const { password } = req.body;

    // Find user
    const user = await (async (): Promise<IUserFull | null>  => {
      switch (req.body.authSource) {
        case 'email':
          return await User.findOne({ email: req.body.email });
        case 'username':
          return await User.findOne({ username: req.body.username });
        default:
          return null;
      }
    })();

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Check password
    const valid = await bcrypt.compare(password, user.passwordHashed);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    // Sign JWT with user._id as claim
    return jwt.sign(
      { sub: user._id.toString() },   // sub = subject claim
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION_SECS },
      (err, token) => {
        if (err) {
          console.log(`Token signing error: ${err}`);
          
          res.status(500).json({ error: err });
        } else {
          res.status(200).json({ token });
        }
      }
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
