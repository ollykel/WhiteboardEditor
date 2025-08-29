import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

import type {
  Result
} from '../utils';

import {
  User,
  IUser,
  IUserFull,
  PatchUserData
} from "../models/User";

import type {
  CreateUserRequest,
} from '../models/User';

import { loginService } from "../services/loginService";

export const getUser = async (userId: Types.ObjectId): Promise<IUserFull | null> => {
  return await User.findOne({ _id: userId });
};// end getUser

export const createUser = async (
  req: Request<{}, {}, CreateUserRequest>,
  res: Response
) => {
  try {
    const { email, username, password } = req.body;

    // --- Validate input ---
    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username, and password are required."});
    }

    // --- Check for existing user ---
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already in use." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already in use." });
    }

    // --- Hash password ---
    const hashed = await bcrypt.hash(password, 10);

    // --- Create user ---
    const user = new User({
      username,
      email,
      passwordHashed: hashed,
    });

    await user.save();

    // --- Automatically log in user via service ---
    try {
      const loginResult = await loginService("username", username, password);
      return res.status(201).json(loginResult);
    } catch (err: any) {
      console.error("Login after signup failed: ", err);   
      return res.status(201).json({ user: { id: user._id, email, password }, token: null })   
    }
    
  } catch (err: any) {
    console.error("Create user failed: ", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export interface PatchUserOkResult {
  type: 'ok';
  data: IUser;
}

export interface PatchUserErrorResult {
  type: 'error';
  message: string;
}

export type PatchUserResult = PatchUserOkResult | PatchUserErrorResult;

export const patchUser = async (user: IUserFull, patchData: PatchUserData): Promise<PatchUserResult> => {
  try {
    const patchDataLocal = { ...patchData };
    const passwordHashed = patchDataLocal.password ? 
      await bcrypt.hash(patchDataLocal.password, 10)
    : user.passwordHashed;

    if (patchDataLocal.password) {
      delete patchDataLocal.password;
    }

    user.set({
      ...patchDataLocal,
      passwordHashed
    });

    const res = await user.save();

    return ({
      type: 'ok',
      data: res
    });
  } catch (err: any) {
    return ({
      type: 'error',
      message: `${err}`
    });
  }
};

export const deleteUser = async (userId: Types.ObjectId): Promise<Result<IUserFull, string>> => {
  try {
    const deletedUser = await User.findOne({ _id: userId });

    if (! deletedUser) {
      return ({
        result: 'err',
        err: 'No such user found'
      });
    } else {
      await deletedUser.deleteOne();

      return ({
        result: 'ok',
        data: deletedUser
      });
    }
  } catch (err: any) {
    return ({
      result: 'err',
      err: `${err}`
    });
  };
};
