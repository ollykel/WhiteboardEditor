// === Web Socket Protocol =====================================================
//
// Defines formats of JSON messages to be passed between the client and the
// server.
//
// =============================================================================

// --- local imports
import type { ShapeModel } from '@/types/ShapeModel';


export type Username = string;
export type CanvasIdType = number;
export type WhiteboardIdType = number;

export interface CanvasData {
  id: CanvasIdType;
  width: number;
  height: number;
  shapes: ShapeModel[];
  allowedUsers: Username[];
}

export interface WhiteboardData {
  id: WhiteboardIdType;
  name: string;
  canvases: CanvasData[];
}

// Sent to an individual client to initialize the whiteboard on their end
export interface ServerMessageInitClient {
  type: "init_client";
  username: Username;
  activeUsers: Username[];
  whiteboard: WhiteboardData;
}

// Notifies clients that a client has joined the session
export interface ServerMessageClientLogin {
  type: "client_login";
  username: Username;
}
//
// Notifies clients that a client has left the session
export interface ServerMessageClientLogout {
  type: "client_logout";
  username: Username;
}

// Creates a new shape in a canvas
export interface ServerMessageCreateShapes {
  type: "create_shapes";
  username: Username;
  canvasId: CanvasIdType;
  shapes: ShapeModel[];
}

export interface ServerMessageCreateCanvas {
  type: "create_canvas";
  username: Username;
  canvasId: CanvasIdType;
  width: number;
  height: number;
  allowedUsers: Username[];
}

// Broadcasts the full list of active users
export interface ServerMessageActiveUsersUpdate {
  type: "active_users_update";
  activeUsers: Username[];
}

// Tagged union of all possible client-server messages
export type SocketServerMessage =
  ServerMessageInitClient
  | ServerMessageClientLogin
  | ServerMessageClientLogout
  | ServerMessageCreateShapes
  | ServerMessageCreateCanvas
  | ServerMessageActiveUsersUpdate;

// Register username on connect
export interface ClientMessageRegister {
  type: "register";
  username: Username;
}

// Notify the server that the client has created a new shape.
export interface ClientMessageCreateShapes {
  type: "create_shapes";
  canvasId: CanvasIdType;
  shapes: ShapeModel[];
}

// Notify server that client has created a new canvas
export interface ClientMessageCreateCanvas {
  type: "create_canvas";
  width: number;
  height: number;
}

// Tagged union of all possible client-server messages
export type SocketClientMessage =
  ClientMessageRegister
  | ClientMessageCreateShapes
  | ClientMessageCreateCanvas;
