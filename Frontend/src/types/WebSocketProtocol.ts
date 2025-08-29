// === Web Socket Protocol =====================================================
//
// Defines formats of JSON messages to be passed between the client and the
// server.
//
// =============================================================================

// --- local imports
import type { ShapeModel } from 'types/ShapeModel';

// The unique identifier for clients within a web socket session.
export type ClientIdType = number;

// Unique identifier for each canvas within a whiteboard
export type CanvasIdType = number;

// Unique identifier for each whiteboard
export type WhiteboardIdType = number;

export interface CanvasData {
  id: CanvasIdType;
  width: number;
  height: number;
  shapes: ShapeModel[];
  allowedUsers: ClientIdType[];
}

export interface WhiteboardData {
  id: WhiteboardIdType;
  name: string;
  canvases: CanvasData[];
}

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
  shapes: ShapeModel[];
}

export interface ServerMessageCreateCanvas {
  type: "create_canvas";
  clientId: ClientIdType;
  canvasId: CanvasIdType;
  width: number;
  height: number;
  allowedUsers: ClientIdType[];
}

// Tagged union of all possible client-server messages
export type SocketServerMessage =
  ServerMessageInitClient
  | ServerMessageClientLogin
  | ServerMessageClientLogout
  | ServerMessageCreateShapes
  | ServerMessageCreateCanvas;

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
  ClientMessageCreateShapes
  | ClientMessageCreateCanvas;
