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
export type ClientIdType = number;

// Unique identifier for each canvas within a whiteboard
export type CanvasIdType = number;

// Unique identifier for each whiteboard
export type WhiteboardIdType = string;

export interface CanvasAttribs {
  id: CanvasIdType;
  width: number;
  height: number;
}

// Contains nested data
export interface CanvasData extends CanvasAttribs {
  shapes: Record<CanvasObjectIdType, CanvasObjectModel>,
  allowedUsers: ClientIdType[];
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

// Sent to an individual client to initialize the whiteboard on their end
export interface ServerMessageInitClient {
  type: "init_client";
  clientId: ClientIdType;
  activeClients: ClientIdType[];
  whiteboard: WhiteboardData;
}

// Notifies clients that a client has joined the session
export interface ServerMessageClientLogin {
  type: "client_login";
  clientId: ClientIdType;
}
//
// Notifies clients that a client has left the session
export interface ServerMessageClientLogout {
  type: "client_logout";
  clientId: ClientIdType;
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
  allowedUsers: ClientIdType[];
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

// Tagged union of all possible client-server messages
export type SocketServerMessage =
  | ServerMessageInitClient
  | ServerMessageClientLogin
  | ServerMessageClientLogout
  | ServerMessageCreateShapes
  | ServerMessageUpdateShapes
  | ServerMessageCreateCanvas
  | ServerMessageIndividualError
  | ServerMessageBroadcastError;

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
  name?: string;
  allowedUsers?: string[];
}

// Tagged union of all possible client-server messages
export type SocketClientMessage =
  | ClientMessageCreateShapes
  | ClientMessageUpdateShapes
  | ClientMessageCreateCanvas;
