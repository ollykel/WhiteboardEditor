// === APIProtocol =============================================================
//
// Defines types of data transferred to and from the internal REST API.
//
// There is some overlap with the data transferred with the web socket protocol;
// care should be taken to distinguish data received from the API vs. via the
// web socket server.
//
// =============================================================================

// -- local imports
import type {
  CanvasObjectModel
} from '@/types/CanvasObjectModel';

// === User ====================================================================
//
// Basic data about a user.
//
// =============================================================================
export interface User {
  _id: string;
  email: string;
  username: string;
}

// === UserPermissionEnum ======================================================
//
// Specifies the permissions a user can have on a whiteboard.
//
// - view: only view the whiteboard
// - edit: view and make edits to the canvases within the whiteboard
// - own: view ane edit the whiteboard, as well as change user permissions and
// change metadata such as the whiteboard name.
//
// =============================================================================
export type UserPermissionEnum = 
  | 'view'
  | 'edit'
  | 'own'
;

// === UserPermission ==========================================================
//
// Specifies the permissions a user has on a given whiteboard. The permissions
// are. Permissions may be specified by either user id or email address. Email
// address permissions need not correspond to an existing user account; this
// permission will be attached to an account by user id when an account with the
// given email address is created.
//
// =============================================================================
export type UserPermission =
  | { type: 'id'; user_id: string; user: User; permission: UserPermissionEnum; }
  | { type: 'email'; email: string; permission: UserPermissionEnum; }
;

// === Canvas ==================================================================
//
// Contains all data about a canvas received via the REST API.
//
// Be aware that canvas data may not be completely up-to-date; up-to-date data
// on canvases and their contents should ideally be fetched from the web socket
// server.
//
// =============================================================================
export interface Canvas {
  id: string;
  width: number;
  height: number;
  time_created: Date;
  time_last_modified: Date;
  allowed_users?: User[];
  shapes?: Record<string, CanvasObjectModel>
}

// === Whiteboard ==============================================================
//
// Contains all data about a whiteboard received via the REST API.
//
// Be aware that canvas data may not be completely up-to-date; up-to-date data
// on canvases and their contents should ideally be fetched from the web socket
// server.
//
// =============================================================================
export interface Whiteboard {
  _id: string;
  name: string;
  owner: User;
  time_created: Date;
  shared_users?: UserPermission[];
  canvases?: Canvas[];
}
