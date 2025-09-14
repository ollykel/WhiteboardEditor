import { Request, Response } from "express";
import { Types } from "mongoose";

// --- local imports
import {
  Whiteboard,
  Canvas,
  type IWhiteboard,
  type WhiteboardIdType,
  type IWhiteboardPermissionEnum,
  type IWhiteboardUserPermission
} from '../models/Whiteboard';

import {
  User,
  type UserIdType
} from '../models/User';

import type {
  AuthorizedRequestBody
} from '../models/Auth';

export interface CreateWhiteboardRequest extends AuthorizedRequestBody {
  name: string;
}

export type GetWhiteboardRes = 
  | { status: 'ok'; whiteboard: IWhiteboard }
  | { status: 'invalid_id' }
  | { status: 'not_found' }
;

export const getWhiteboardById = async (whiteboardId: string): Promise<GetWhiteboardRes> => {
  if (! Types.ObjectId.isValid(whiteboardId)) {
    return ({ status: 'invalid_id' });
  }

  const whiteboards = await Whiteboard.findFull({ _id: whiteboardId });

  if ((! whiteboards) || (whiteboards.length < 1)) {
    return ({ status: 'not_found' });
  } else {
    const whiteboardObj = whiteboards[0].toObject();
    const sharedUsers: IWhiteboardUserPermission[] = await Promise.all(whiteboardObj.shared_users.map(async (perm: IWhiteboardUserPermission) => {
      switch (perm.type) {
        case 'id':
          return ({
            ...perm,
            user: await User.findById(perm.user_id)
          });
        default:
          return perm;
      }
    }));

    whiteboardObj.shared_users = sharedUsers;

    return ({ status: 'ok', whiteboard: whiteboardObj });
  }
};

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

    const whiteboardOut = await whiteboard.save();
    
    res.status(201).json(whiteboardOut.toJSON({ virtuals: true }));
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export interface WhiteboardPermissionRequest {
  email: string;
  permission: IWhiteboardPermissionEnum;
}

export type ShareWhiteboardResType =
  | { status: "success"; whiteboard: IWhiteboard }
  | { status: "no_whiteboard" }
  | { status: "invalid_users"; invalid_users: UserIdType[] }
  | { status: "invalid_permissions"; invalid_permissions: IWhiteboardUserPermission[] }
  | { status: "forbidden" }
  | { status: "exception"; message: string };

export const addSharedUsers = async (
  whiteboardId: WhiteboardIdType,
  ownerId: UserIdType,
  userPermissions: IWhiteboardUserPermission[]
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
    if (! whiteboard.owner._id.equals(ownerId)) {
      return { status: "forbidden" };
    }

    const permissionsById = userPermissions.filter(perm => perm.type === 'id');

    if (permissionsById.length > 0) {
      // ensure all permissions by id are valid
      const malformedUserIds = permissionsById
        .filter(perm => (! Types.ObjectId.isValid(perm.user_id)))
        .map(perm => perm.user_id);

      if (malformedUserIds.length > 0) {
        return {
          status: 'invalid_users',
          invalid_users: malformedUserIds
        };
      }
      
      const userIds = permissionsById.map(perm => perm.user_id);

      // validate users exist
      const foundUsers = await User.find({ _id: { $in: userIds } }).select("_id");
      const foundIds = foundUsers.map((u) => u.id.toString());
      const invalidUsers = userIds.filter(u => (! foundIds.includes(u.toString())));

      if (invalidUsers.length > 0) {
        return { status: "invalid_users", invalid_users: invalidUsers };
      }
    }

    // try to convert emails to user ids, if users accounts exist
    const permissionsByEmail = userPermissions.filter(perm => perm.type === 'email');
    const permissionEmails: string[] = permissionsByEmail.map(perm => perm.email);
    const emailsToPermissions = Object.fromEntries(permissionsByEmail.map(perm => [
      perm.email, perm
    ]));
    const foundUsersByEmail = await User.find({ email: { $in: permissionEmails } });
    const foundEmailSet: Record<string, boolean> = Object.fromEntries(foundUsersByEmail.map(user => [user.email, true]));
    const permissionsByIdFromEmail: IWhiteboardUserPermission[] = foundUsersByEmail.map(user => ({
      type: 'id',
      user_id: user.id,
      user,
      permission: emailsToPermissions[user.email].permission,
    }));
    const finalEmailPermissions : IWhiteboardUserPermission[] = permissionsByEmail.filter(perm => !(perm.email in foundEmailSet));
    const finalPermissions = [
      ...permissionsById,
      ...permissionsByIdFromEmail,
      ...finalEmailPermissions
    ];

    if (finalPermissions.length > 0) {
      // fully replace old permissions
      whiteboard.shared_users = finalPermissions;

      return ({
        status: "success",
        whiteboard: await whiteboard.save()
      });
    } else {
      // Trivial success: return true
      return { status: "success", whiteboard };
    }
  } catch (err: any) {
    console.error(`Error sharing whiteboard ${whiteboardId}:`, err);
    return {
      status: 'exception',
      message: `${err}`
    };
  }
};
