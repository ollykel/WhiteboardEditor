import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

import {
  User,
  IUser,
  IUserFull,
  PatchUserData
} from "../models/User";

import type {
  CreateUserRequest,
} from '../models/User';

export const getUser = async (userId: Types.ObjectId): Promise<IUserFull | null> => {
  return await User.findOne({ _id: userId });
};// end getUser

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
