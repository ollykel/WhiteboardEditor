import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

import type {
  Result,
  SetInclusionOptionType,
} from '../utils';

import {
  User,
  PatchUserData,
  type IUser,
  type IUserPublicView,
  type CreateUserRequest,
} from "../models/User";

import {
  Whiteboard,
  type IWhiteboardAttribView,
  type IWhiteboardPermissionEnum,
} from '../models/Whiteboard';

import { loginService } from "../services/loginService";

export const getUser = async (userId: Types.ObjectId): Promise<IUser | null> => {
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

    const userFinal = await user.save();

    // --- Automatically log in user via service ---
    try {
      const loginResult = await loginService("username", username, password);
      return res.status(201).json({
        user: userFinal.toPublicView(),
        token: loginResult.token
      });
    } catch (err: any) {
      console.error("Login after signup failed: ", err);   
      return res.status(500).json({ message: 'Unexpected login failure' })   
    }
    
  } catch (err: any) {
    console.error("Create user failed: ", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export interface PatchUserOkResult {
  type: 'ok';
  data: IUserPublicView;
}

export interface PatchUserErrorResult {
  type: 'error';
  message: string;
}

export type PatchUserResult = PatchUserOkResult | PatchUserErrorResult;

export const patchUser = async (user: IUser, patchData: PatchUserData): Promise<PatchUserResult> => {
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

    const userModified = await user.save();

    return ({
      type: 'ok',
      data: userModified.toPublicView()
    });
  } catch (err: any) {
    return ({
      type: 'error',
      message: `${err}`
    });
  }
};

export const deleteUser = async (userId: Types.ObjectId): Promise<Result<IUserPublicView, string>> => {
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
        data: deletedUser.toPublicView()
      });
    }
  } catch (err: any) {
    return ({
      result: 'err',
      err: `${err}`
    });
  };
};

export type GetSharedWhiteboardsByUserRes =
  | { status: 'server_error'; }
  | { status: 'user_not_found'; }
  | { status: 'ok'; whiteboards: IWhiteboardAttribView[]; }
;

export const getSharedWhiteboardsByUser = async (
  userId: Types.ObjectId,
  includePermissionOpts: SetInclusionOptionType<IWhiteboardPermissionEnum>,
): Promise<GetSharedWhiteboardsByUserRes> => {
  try {
    const permissionsFilter : object = (() => {
      switch (includePermissionOpts.type) {
        case 'all':
          return ({ '$nin': [] });
        case 'include':
          return ({ '$in': includePermissionOpts.included });
        case 'exclude':
          return ({ '$nin': includePermissionOpts.excluded });
        default:
          throw new Error(`Unhandled case: ${includePermissionOpts}`);
      }
    })();

    const query = ({
      shared_users: {
        '$elemMatch': {
          type: 'user',
          user: userId,
          permission: permissionsFilter
        }
      }
    });

    const whiteboards = await Whiteboard.findAttribViews(query);

    // success
    return ({
      status: 'ok',
      whiteboards
    });
  } catch (e: any) {
    console.error(
      'An unexpected error occurred while attempting to get whiteboards shared with user',
      userId, ':', e
    );

    return ({
      status: 'server_error'
    });
  }
};
