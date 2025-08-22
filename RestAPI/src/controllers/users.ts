import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcrypt";

import type { CreateUserRequest } from '../models/User';

export const createUser = async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      passwordHashed: hashed,
    });

    await user.save();
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
