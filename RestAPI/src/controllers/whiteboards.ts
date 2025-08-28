import { Request, Response } from "express";
import { Types } from "mongoose";
import { BSONError } from "bson";

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
  | { status: "forbidden" }
  | { status: "exception"; message: string };

export const addSharedUsers = async (
  whiteboardId: WhiteboardIdType,
  ownerId: UserIdType,
  users: UserIdType[]
): Promise<ShareWhiteboardResType> => {
  try {

    // first, ensure given id can actually be cast to an ObjectId
    try {
      new Types.ObjectId(whiteboardId);
    } catch (e: any) {
      if (e instanceof BSONError) {
        // it's a bad object ID
        return { status: "no_whiteboard" };
      } else {
        // some other error
        throw e;
      }
    }

    // then, ensure all user ids are valid
    const malformedUserIds = users.filter((uid) => {
      try {
        new Types.ObjectId(uid);

        return false;
      } catch (e: any) {
        if (e instanceof BSONError) {
          return true;
        } else {
          // some other error; throw to outside catch block
          throw e;
        }
      }
    });

    if (malformedUserIds.length > 0) {
      return {
        status: 'invalid_users',
        invalid_users: malformedUserIds
      };
    }

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
  } catch (err: any) {
    console.error(`Error sharing whiteboard ${whiteboardId}:`, err);
    return {
      status: 'exception',
      message: `${err}`
    };
  }
};
