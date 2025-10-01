import {
  Types,
} from "mongoose";

// --- local imports
import {
  Whiteboard,
  type IWhiteboard,
  type WhiteboardIdType,
  type IWhiteboardUserPermission,
  type IWhiteboardUserPermissionById,
  type IWhiteboardUserPermissionByEmail,
} from '../models/Whiteboard';

import {
  User,
  type IUser,
  type UserIdType,
} from '../models/User';

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
