import { Request, Response } from "express";
import {
  Types
} from "mongoose";

// --- local imports
import {
  Whiteboard,
  Canvas,
  type IWhiteboard,
  type IWhiteboardAttribView,
  type WhiteboardIdType,
  type IWhiteboardPermissionEnum,
  type IWhiteboardUserPermission,
  type IWhiteboardUserPermissionById,
  type IWhiteboardUserPermissionByEmail,
} from '../models/Whiteboard';

import {
  User,
  type IUser,
  type UserIdType,
} from '../models/User';

import type {
  AuthorizedRequestBody
} from '../models/Auth';

export interface CreateWhiteboardRequest extends AuthorizedRequestBody {
  name: string;
  collaboratorEmails?: string[];
}

export type GetWhiteboardRes = 
  | { status: 'ok'; whiteboard: IWhiteboard<IUser>; }
  | { status: 'invalid_id'; }
  | { status: 'not_found'; }
  | { status: 'server_error'; message: string; }
;

export const getWhiteboardById = async (whiteboardId: string): Promise<GetWhiteboardRes> => {
  try {
    if (! Types.ObjectId.isValid(whiteboardId)) {
      return ({ status: 'invalid_id' });
    }

    let whiteboard = await Whiteboard.findById(whiteboardId)
      .then(wb => wb?.populateAttribs() || null);

    if (! whiteboard) {
      return ({ status: 'not_found' });
    } else {
      // track whether we change any email-based permissions to user-based
      // permissions
      let haveSharedUsersChanged = false;
      const sharedUsers: IWhiteboardUserPermission<Types.ObjectId>[] = await Promise.all(whiteboard.shared_users
          .map(async (perm: IWhiteboardUserPermission<IUser>) => {
        switch (perm.type) {
          case 'user':
            return ({
              ...perm,
              user: perm.user._id,
            });
          case 'email':
            // check if this email now belongs to a registered user
            const user = await User.findOne({ email: perm.email });
            console.log('!! Found email-identified user:', user);

            if (user) {
              haveSharedUsersChanged = true;
              return ({
                type: 'user',
                user: user._id,
                permission: perm.permission,
              });
            } else {
              return perm; // keep as email if still unregistered
            }
          default:
            throw new Error(`Unrecognized permission type: ${perm}`);
        }
      }));

      if (haveSharedUsersChanged) {
        // reset the whiteboard's shared_users field in-database, then refetch the
        // whiteboard
        whiteboard.set('shared_users', sharedUsers);
        whiteboard = await whiteboard.save()
          .then(wb => wb.populateAttribs());
      }

      if (! whiteboard) {
        throw new Error(`Whiteboard ${whiteboardId} not properly (re-)fetched`);
      }

      console.log("Returning whiteboard:", JSON.stringify(whiteboard, null, 2));

      return ({
        status: 'ok',
        whiteboard,
      });
    }
  } catch (err: any) {
    console.log('Error fetching whiteboard', whiteboardId, ':', err);
    return ({
      status: 'server_error',
      message: 'An unexpected error occurred',
    });
  }
};

export const getWhiteboardsByOwner = async (ownerId: Types.ObjectId): Promise<IWhiteboardAttribView[]> => {
  return await Whiteboard.findAttribs({ owner: ownerId }) as IWhiteboardAttribView[];
};// end getWhiteboardsByOwner

export type GetSharedUsersByWhiteboardRes =
  | { status: 'ok'; sharedUsers: IWhiteboardUserPermission <IUser>[]; }
  | { status: 'whiteboard_not_found'; }
;

export const getSharedUsersByWhiteboard = async (whiteboardId: Types.ObjectId): Promise<GetSharedUsersByWhiteboardRes> => {
  const sharedUsers: IWhiteboardUserPermission <IUser>[] | null = await Whiteboard.findSharedUsersByWhiteboardId(whiteboardId);

  if (! Array.isArray(sharedUsers)) {
    return ({ status: 'whiteboard_not_found', });
  } else {
    return ({
      status: 'ok',
      sharedUsers
    });
  }
};

export const createWhiteboard = async (
  req: Request<{}, any, CreateWhiteboardRequest, {}>,
  res: Response
) => {
  try {
    const { authUser, name } = req.body;
    const { id: ownerId } = authUser;
    console.log("createWhiteboard req.body: ", req.body);
    
    // Give owner 'own' permission for shared_users
    const ownerPermission: IWhiteboardUserPermission <Types.ObjectId> = {
      type: 'user',
      user: ownerId,
      permission: 'own'
    };

    // Get collaborator emails if provided
    const collaboratorEmails: string[] = req.body.collaboratorEmails || [];

    // Fetch users whose emails match
    const foundUsers = await User.find({ email: { $in: collaboratorEmails } });

    // Create quick lookup
    const foundEmails = new Set(foundUsers.map(u => u.email));

    // Permissions for users that exist in DB
    const collarboratorPermissionsFromUsers: IWhiteboardUserPermission <Types.ObjectId>[] =
      foundUsers.map(user => ({
        type: 'user',
        user: user._id,
        permission: 'edit',
      }) as IWhiteboardUserPermissionById <Types.ObjectId>);

    // For emails that don't match an account, keep them as email permissions
    const collarboratorPermissionsFromEmail: IWhiteboardUserPermissionByEmail[] = 
      collaboratorEmails
        .filter(email => !foundEmails.has(email))
        .map(email => ({
          type: 'email',
          email,
          permission: 'edit',
        }));

    const collaboratorPermissions = [
      ...collarboratorPermissionsFromUsers,
      ...collarboratorPermissionsFromEmail
    ];

    const whiteboard = new Whiteboard({
      name,
      // canvases: [defaultCanvas], // TODO: remove
      owner: ownerId,
      shared_users: [ownerPermission, ...collaboratorPermissions]
    });

    console.log('Attempting to create new whiteboard:', whiteboard);

    const whiteboardOut = await whiteboard.save();

    // initialize every new whiteboard with a single empty canvas
    const defaultCanvas = new Canvas({
      whiteboard_id: whiteboardOut._id,
      name: "Main Canvas",
      id: 0,
      width: 512,
      height: 512,
      allowed_users: [],
    });

    await defaultCanvas.save();
    await whiteboardOut.populate([
      'owner',
      'shared_users',
      'canvases',
    ]);
    
    res.status(201).json(whiteboardOut);
  } catch (err: any) {
    console.log('Server Error:', err);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

export interface WhiteboardPermissionRequest {
  email: string;
  permission: IWhiteboardPermissionEnum;
}

export type ShareWhiteboardResType =
  | { status: "success"; whiteboard: IWhiteboard<IUser> }
  | { status: "no_whiteboard" }
  | { status: "invalid_users"; invalid_users: UserIdType[] }
  | { status: "invalid_permissions"; invalid_permissions: IWhiteboardUserPermission <Types.ObjectId>[] }
  | { status: "forbidden" }
  | { status: "exception"; message: string };

export const addSharedUsers = async (
  whiteboardId: WhiteboardIdType,
  ownerId: UserIdType,
  userPermissions: IWhiteboardUserPermission <Types.ObjectId>[]
): Promise<ShareWhiteboardResType> => {
  try {
    // first, ensure given id can actually be cast to an ObjectId
    if (! Types.ObjectId.isValid(whiteboardId)) {
      return { status: "no_whiteboard" };
    }

    const whiteboards = await Whiteboard.findAttribs({ _id: whiteboardId });

    if ((! whiteboards) || (whiteboards.length < 1)) {
      return { status: "no_whiteboard" };
    }

    const whiteboard = whiteboards[0];

    // verify ownership
    if (! whiteboard.owner._id.equals(ownerId)) {
      return { status: "forbidden" };
    }

    const permissionsById = userPermissions.filter(perm => perm.type === 'user');

    if (permissionsById.length > 0) {
      // ensure all permissions by id are valid
      const malformedUserIds = permissionsById
        .filter(perm => (! Types.ObjectId.isValid(perm.user)))
        .map(perm => perm.user);

      if (malformedUserIds.length > 0) {
        return {
          status: 'invalid_users',
          invalid_users: malformedUserIds
        };
      }
      
      const userIds = permissionsById.map(perm => perm.user);

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
    const permissionsByIdFromEmail: IWhiteboardUserPermissionById<Types.ObjectId>[] = foundUsersByEmail.map(user => ({
      type: 'user',
      user: user._id,
      permission: emailsToPermissions[user.email].permission,
    }));
    const finalEmailPermissions : IWhiteboardUserPermissionByEmail[] = permissionsByEmail.filter(perm => !(perm.email in foundEmailSet));
    const finalPermissions = [
      ...permissionsById,
      ...permissionsByIdFromEmail,
      ...finalEmailPermissions
    ];

    if (finalPermissions.length > 0) {
      // fully replace old permissions
      whiteboard.set('shared_users', finalPermissions);

      await whiteboard.save()
        .then(wb => wb.populateAttribs());

      return ({
        status: "success",
        whiteboard,
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
