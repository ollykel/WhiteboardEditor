import { Request, Response } from "express";
import {
  Types
} from "mongoose";

// --- local imports
import {
  Whiteboard,
  Canvas,
  type IWhiteboardFull,
  type IWhiteboardAttribView,
  type WhiteboardIdType,
  type IWhiteboardPermissionEnum,
  type IWhiteboardUserPermission,
  type IWhiteboardUserPermissionModel,
  type IWhiteboardUserPermissionById,
  type IWhiteboardUserPermissionByEmail,
} from '../models/Whiteboard';

import {
  User,
  type IUser,
} from '../models/User';

import type {
  AuthorizedRequestBody
} from '../models/Auth';

import {
  addSharedUsers,
} from '../services/whiteboardService';

export interface CreateWhiteboardRequest extends AuthorizedRequestBody {
  name: string;
  collaboratorEmails?: string[];
}

export type GetWhiteboardRes = 
  | { status: 'ok'; whiteboard: IWhiteboardFull; }
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
      const sharedUsers: IWhiteboardUserPermissionModel<Types.ObjectId>[] = await Promise.all(whiteboard.shared_users
          .map(async perm => {
        switch (perm.type) {
          case 'user':
            return ({
              ...perm,
              user: perm.user._id,
            }) ;
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
    const ownerPermission: IWhiteboardUserPermissionModel<Types.ObjectId> = {
      type: 'user',
      user: ownerId,
      permission: 'own',
    };

    // Get collaborator emails if provided
    const collaboratorEmails: string[] = req.body.collaboratorEmails || [];

    // Fetch users whose emails match
    const foundUsers = await User.find({ email: { $in: collaboratorEmails } });

    // Create quick lookup
    const foundEmails = new Set(foundUsers.map(u => u.email));

    // Permissions for users that exist in DB
    const collarboratorPermissionsFromUsers: IWhiteboardUserPermissionModel <Types.ObjectId>[] =
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

    // initialize every new whiteboard with a single empty canvas
    const rootCanvasModel = new Canvas({
      name: "Main Canvas",
      id: 0,
      width: 512,
      height: 512,
      allowed_users: [],
    });

    const rootCanvas = await rootCanvasModel.save();

    const whiteboard = new Whiteboard({
      name,
      // canvases: [defaultCanvas], // TODO: remove
      owner: ownerId,
      root_canvas: rootCanvas._id,
      shared_users: [ownerPermission, ...collaboratorPermissions]
    });

    console.log('Attempting to create new whiteboard:', whiteboard);

    const whiteboardOut = await whiteboard.save()
      .then(wb => wb.populateFull());
    
    res.status(201).json(whiteboardOut.toPublicView());
  } catch (err: any) {
    console.log('Server Error:', err);
    res.status(500).json({ message: "Unexpected server error" });
  }
};

export interface WhiteboardPermissionRequest {
  email: string;
  permission: IWhiteboardPermissionEnum;
}

export interface ShareWhiteboardRequestBody extends AuthorizedRequestBody {
  userPermissions: IWhiteboardUserPermission<Types.ObjectId>[];
}

export const shareWhiteboard = async (
  req: Request<{ id: WhiteboardIdType }, any, ShareWhiteboardRequestBody>,
  res: Response
) => {
  try {
    const { id: whiteboardId } = req.params;
    const { authUser, userPermissions } = req.body;

    const result = await addSharedUsers(
      whiteboardId,
      authUser.id,
      userPermissions
    );

    switch (result.status) {
      case "success":
        return res.status(200).json(result.whiteboard.toAttribView());
      case "no_whiteboard":
        return res.status(404).json({ error: "Whiteboard not found" });
      case "invalid_users":
        return res
          .status(400)
          .json({ error: "Invalid users", invalid_users: result.invalid_users });
      case "forbidden":
        return res.status(403).json({ error: "You do not own this whiteboard" });
      default:
        console.error('Unexpected error:', result);
        return res.status(500).json({ error: "Unexpected error" });
    }
  } catch (err: any) {
    console.error("Error sharing whiteboard:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
