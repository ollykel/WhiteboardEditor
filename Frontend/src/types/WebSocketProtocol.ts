// === Web Socket Protocol =====================================================
//
// Defines formats of JSON messages to be passed between the client and the
// server.
//
// =============================================================================

// --- local imports
import type { ShapeModel } from '@/types/ShapeModel';

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
}

export interface WhiteboardData {
  id: WhiteboardIdType;
  name: string;
  canvases: CanvasData[];
}

// Sent to an individual client to initialize the whiteboard on their end
export interface MessageInitClient {
  type: "init_client";
  clientId: ClientIdType;
  activeClients: ClientIdType[];
  whiteboard: WhiteboardData;
}

// Notifies clients that a client has joined the session
export interface MessageClientLogin {
  type: "client_login";
  clientId: ClientIdType;
}
//
// Notifies clients that a client has left the session
export interface MessageClientLogout {
  type: "client_logout";
  clientId: ClientIdType;
}

// Creates a new shape in a canvas
export interface MessageCreateShape {
  type: "create_shape";
  clientId: ClientIdType;
  canvasId: CanvasIdType;
  shape: ShapeModel;
}

// Tagged union of all possible client-server messages
export type SocketMessage =
  MessageInitClient
  | MessageClientLogin
  | MessageClientLogout
  | MessageCreateShape;
