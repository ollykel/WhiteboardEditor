// === CanvasObjectModel =======================================================
//
// Different types of shapes that can be drawn within a Canvas.
//
// =============================================================================

import type {
  WhiteboardIdType,
  CanvasIdType
} from '@/types/WebSocketProtocol';

export type ShapeColor = string;

export type CanvasObjectIdType = number;

export interface CanvasObjectBase {
  strokeColor: ShapeColor;
  strokeWidth: number;
}

// === CanvasObjectRecord ======================================================
//
// Include unique identifiers for storage within state management.
//
// =============================================================================
export interface CanvasObjectRecord extends CanvasObjectBase {
  id: CanvasObjectIdType;
  canvasId: CanvasIdType;
  whiteboardId: WhiteboardIdType;
}

export interface ShapeModelAttributes {
  x: number;
  y: number;
  fillColor: ShapeColor;
}

export type ShapeModelBase = CanvasObjectRecord & ShapeModelAttributes;

export interface RectModel extends ShapeModelBase {
  type: 'rect';
  width: number;
  height: number;
}

export interface EllipseModel extends ShapeModelBase {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
}

export interface VectorModel extends CanvasObjectRecord {
  type: 'vector';
  points: number[];
}

export type CanvasObjectModel = RectModel | EllipseModel | VectorModel;
