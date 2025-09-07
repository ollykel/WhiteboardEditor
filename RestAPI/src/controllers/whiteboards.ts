import { Request, Response } from "express";
import { Types } from "mongoose";

// --- local imports
import {
  Whiteboard,
  Canvas,
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

    // initialize every new whiteboard with a single empty canvas
    const defaultCanvas = new Canvas({
      width: 512,
      height: 512,
      allowed_users: [],
      shapes: {}
    });

    const whiteboard = new Whiteboard({
      name,
      canvases: [defaultCanvas],
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
  | { status: "invalid_emails"; invalid_users: string[] }
  | { status: "forbidden" }
  | { status: "exception"; message: string };

export const addSharedUsers = async (
  whiteboardId: WhiteboardIdType,
  ownerId: UserIdType,
  users:
    | { userIdType: 'id'; ids: UserIdType[]; }
    | { userIdType: 'email'; emails: string[]; }
): Promise<ShareWhiteboardResType> => {
  try {
    // first, ensure given id can actually be cast to an ObjectId
    if (! Types.ObjectId.isValid(whiteboardId)) {
      return { status: "no_whiteboard" };
    }

    const whiteboard = await Whiteboard.findById(whiteboardId);

    if (!whiteboard) {
      return { status: "no_whiteboard" };
    }

    // verify ownership
    if (! whiteboard.owner.equals(ownerId)) {
      return { status: "forbidden" };
    }

    let usersToShare : UserIdType[];

    switch (users.userIdType) {
      case 'id':
        {
          const { ids } = users;

          // ensure all user ids are valid
          const malformedUserIds = ids.filter((uid) => (! Types.ObjectId.isValid(uid)));

          if (malformedUserIds.length > 0) {
            return {
              status: 'invalid_users',
              invalid_users: malformedUserIds
            };
          }

          // validate users exist
          const foundUsers = await User.find({ _id: { $in: ids } }).select("_id");
          const foundIds = foundUsers.map((u) => u._id.toString());
          const invalidUsers = ids.filter((u) => !foundIds.includes(u.toString()));

          if (invalidUsers.length > 0) {
            return { status: "invalid_users", invalid_users: invalidUsers };
          }

          usersToShare = ids;
        }
        break;
      case 'email':
        {
          const { emails } = users;

          // validate users exist
          const foundUsers = await User.find({ email: { $in: emails } }).select("_id email");
          const foundEmails = foundUsers.map(u => u.email);
          const invalidEmails = emails.filter(u => !foundEmails.includes(u.toString()));

          if (invalidEmails.length > 0) {
            return { status: "invalid_emails", invalid_users: invalidEmails };
          }

          usersToShare = foundUsers.map(u => u._id);
        }
        break;
    }
    // ensure all user ids are valid
    const malformedUserIds = usersToShare.filter((uid) => (! Types.ObjectId.isValid(uid)));

    if (malformedUserIds.length > 0) {
      return {
        status: 'invalid_users',
        invalid_users: malformedUserIds
      };
    }

    // add new shared users (skip already added)
    const currentShared = whiteboard.shared_users.map((u) => u.toString());
    const toAdd = usersToShare.filter((u) => !currentShared.includes(u.toString()));

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
