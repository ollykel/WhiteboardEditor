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
export type CanvasObjectKeyType = [WhiteboardIdType, CanvasIdType, CanvasObjectIdType];

export interface ObjectID {
  id: CanvasObjectIdType;
}

export interface ObjectUID extends ObjectID {
  canvasId: CanvasIdType;
  whiteboardId: WhiteboardIdType;
}

export interface ShapeModelAttributes {
  x: number;
  y: number;
  fillColor: ShapeColor;
}

export type ShapeModelBase = CanvasObjectBase & ShapeModelAttributes;

export interface RectModel extends ShapeModelBase {
  type: 'rect';
  width: number;
  height: number;
}

export type RectRecord = RectModel & ObjectID;
export type RectRecordFull = RectModel & ObjectUID;

export interface EllipseModel extends ShapeModelBase {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
}

export type EllipseRecord = EllipseModel & ObjectID;
export type EllipseRecordFull = EllipseModel & ObjectUID;

export interface VectorModel extends CanvasObjectBase {
  type: 'vector';
  points: number[];
}

export type VectorRecord = VectorModel & ObjectID;
export type VectorRecordFull = VectorModel & ObjectUID;

export type ShapeModel = RectModel | EllipseModel;
export type ShapeRecord = RectRecord | EllipseRecord;
export type ShapeRecordFull = RectRecordFull | EllipseRecordFull;

export type CanvasObjectModel = ShapeModel | VectorModel;
export type CanvasObjectRecord = ShapeRecord | VectorRecord;
export type CanvasObjectRecordFull = ShapeRecordFull | VectorRecordFull;
