// === Web Socket Protocol =====================================================
//
// Defines formats of JSON messages to be passed between the client and the
// server.
//
// =============================================================================

// --- local imports
import type {
  CanvasObjectIdType,
  CanvasObjectModel,
  CanvasObjectRecord
} from '@/types/CanvasObjectModel';

// The unique identifier for clients within a web socket session.
// -- string represents Mongo ObjectId
export type ClientIdType = string;

// Unique identifier for each canvas within a whiteboard
// -- string represents Mongo ObjectId
export type CanvasIdType = string;

// Unique identifier for each whiteboard
export type WhiteboardIdType = string;

// User presence update (canonical list of active users)
export interface UserSummary {
  userId: string;
  username: string;
}

export interface CanvasAttribs {
  id: CanvasIdType;
  width: number;
  height: number;
  name: string;
  timeCreated?: string;
  timeLastModified?: string;
}

// Contains nested data
export interface CanvasData extends CanvasAttribs {
  shapes: Record<CanvasObjectIdType, CanvasObjectModel>,
  allowedUsers: UserSummary[];
}

// Ensure unique id by including whiteboard id
export type CanvasKeyType = [WhiteboardIdType, CanvasIdType];

export interface CanvasRecord extends CanvasAttribs {
  whiteboardId: WhiteboardIdType;
}

export interface WhiteboardAttribs {
  id: WhiteboardIdType;
  name: string;
}

// Contains nested data
export interface WhiteboardData extends WhiteboardAttribs {
  canvases: CanvasData[];
}

export type WhiteboardRecord = WhiteboardAttribs;

// ========================== SERVER → CLIENT ==================================

// Sent to an individual client to initialize the whiteboard on their end
export interface ServerMessageInitClient {
  type: "init_client";
  clientId: ClientIdType;
  whiteboard: WhiteboardData;
}

export interface ServerMessageActiveUsers {
  type: "active_users";
  users: UserSummary[];
}

// Creates a new shape in a canvas
export interface ServerMessageCreateShapes {
  type: "create_shapes";
  clientId: ClientIdType;
  canvasId: CanvasIdType;
  shapes: Record<CanvasObjectIdType, CanvasObjectRecord>;
}

// Update existing shapes in a canvas
export interface ServerMessageUpdateShapes {
  type: "update_shapes";
  clientId: ClientIdType;
  canvasId: CanvasIdType;
  shapes: Record<CanvasObjectIdType, CanvasObjectRecord>;
}

export interface ServerMessageCreateCanvas {
  type: "create_canvas";
  clientId: ClientIdType;
  canvasId: CanvasIdType;
  width: number;
  height: number;
  name: string;
  allowedUsers: UserSummary[];
}

export interface ServerMessageDeleteCanvases {
  type: "delete_canvases";
  clientId: ClientIdType;
  canvasIds: CanvasIdType[];
}

export interface ServerMessageIndividualError {
  type: 'individual_error';
  clientId: ClientIdType;
  message: string;
}

export interface ServerMessageBroadcastError {
  type: 'broadcast_error';
  message: string;
}

export interface ServerMessageUpdateAllowedUsers {
  type: 'update_canvas_allowed_users';
  canvasId: string;
  allowedUsers: UserSummary[];
}

// Tagged union of all possible client-server messages
export type SocketServerMessage =
  | ServerMessageInitClient
  | ServerMessageActiveUsers
  | ServerMessageCreateShapes
  | ServerMessageUpdateShapes
  | ServerMessageCreateCanvas
  | ServerMessageDeleteCanvases
  | ServerMessageIndividualError
  | ServerMessageBroadcastError
  | ServerMessageUpdateAllowedUsers;

// ========================== CLIENT → SERVER ==================================

// Notify server of identity on first connection
export interface ClientMessageLogin {
  type: "login";
  userId: string; // MongoDB _id as string
  username: string;
}

// Notify the server that the client has created a new shape.
export interface ClientMessageCreateShapes {
  type: "create_shapes";
  canvasId: CanvasIdType;
  shapes: CanvasObjectModel[];
}

// Notify the server that the client has updated shape(s)
export interface ClientMessageUpdateShapes {
  type: "update_shapes";
  canvasId: CanvasIdType;
  shapes: Record<CanvasObjectIdType, CanvasObjectModel>;
}

// Notify server that client has created a new canvas
export interface ClientMessageCreateCanvas {
  type: "create_canvas";
  width: number;
  height: number;
  name: string;
  allowedUsers?: UserSummary[];
}

// Notify server that client has deleted canvases
export interface ClientMessageDeleteCanvases {
  type: "delete_canvases";
  canvasIds: CanvasIdType[];
}

// Notify server that client has updated allowed users in a canvas
export interface ClientMessageUpdateAllowedUsers {
  type: "update_canvas_allowed_users";
  canvasId: string;
  allowedUsers: UserSummary[];
}

// Tagged union of all possible client-server messages
export type SocketClientMessage =
  | ClientMessageLogin
  | ClientMessageCreateShapes
  | ClientMessageUpdateShapes
  | ClientMessageCreateCanvas
  | ClientMessageDeleteCanvases
  | ClientMessageUpdateAllowedUsers;
