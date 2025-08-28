import { Request, Response } from "express";
import { Types } from "mongoose";

// --- local imports
import {
  Whiteboard,
  IWhiteboard,
  WhiteboardIdType
} from '../models/Whiteboard';

import {
  User
} from '../models/User';

import type {
  UserIdType
} from '../models/User';

import type {
  AuthorizedRequestBody
} from '../models/Auth';

export interface CreateWhiteboardRequest extends AuthorizedRequestBody {
  name: string;
}

export const getWhiteboardsByOwner = async (ownerId: Types.ObjectId): Promise<IWhiteboard[]> => {
  return await Whiteboard.find({ owner: ownerId });
};// end getWhiteboardsByOwner

export const createWhiteboard = async (
  req: Request<{}, any, CreateWhiteboardRequest, {}>,
  res: Response
) => {
  try {
    const { authUser, name } = req.body;
    const { id: ownerId } = authUser;

    const whiteboard = new Whiteboard({
      name,
      canvases: [],
      owner: ownerId,
      shared_users: []
    });

    console.log('Attempting to create new whiteboard:', whiteboard);

    await whiteboard.save();
    res.status(201).json(whiteboard);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export type ShareWhiteboardResType =
  | { status: "success"; whiteboard: IWhiteboard }
  | { status: "no_whiteboard" }
  | { status: "invalid_users"; invalid_users: UserIdType[] }
  | { status: "forbidden" };

export const addSharedUsers = async (
  whiteboardId: WhiteboardIdType,
  ownerId: UserIdType,
  users: UserIdType[]
): Promise<ShareWhiteboardResType> => {
  const whiteboard = await Whiteboard.findById(whiteboardId);

  if (!whiteboard) {
    return { status: "no_whiteboard" };
  }

  // verify ownership
  if (!whiteboard.owner.equals(ownerId)) {
    return { status: "forbidden" };
  }

  // validate users exist
  const foundUsers = await User.find({ _id: { $in: users } }).select("_id");
  const foundIds = foundUsers.map((u) => u._id.toString());
  const invalidUsers = users.filter((u) => !foundIds.includes(u.toString()));

  if (invalidUsers.length > 0) {
    return { status: "invalid_users", invalid_users: invalidUsers };
  }

  // add new shared users (skip already added)
  const currentShared = whiteboard.shared_users.map((u) => u.toString());
  const toAdd = users.filter((u) => !currentShared.includes(u.toString()));

  if (toAdd.length > 0) {
    whiteboard.shared_users.push(...toAdd);
    await whiteboard.save();
  }

  return { status: "success", whiteboard };
};
