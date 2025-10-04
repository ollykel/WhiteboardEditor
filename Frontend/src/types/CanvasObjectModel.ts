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

// -- string represents Mongo ObjectId
export type CanvasObjectIdType = string;

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
  rotation: number;
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

// TODO: Pull out common fields and extend is possible
export interface TextModel {
  type: 'text';
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type TextRecord = TextModel & ObjectID;
export type TextRecordFull = TextModel & ObjectUID;

export type ShapeModel = RectModel | EllipseModel | TextModel;
export type ShapeRecord = RectRecord | EllipseRecord | TextRecord;
export type ShapeRecordFull = RectRecordFull | EllipseRecordFull | TextRecordFull;

export type CanvasObjectModel = ShapeModel | VectorModel | TextModel;
export type CanvasObjectRecord = ShapeRecord | VectorRecord | TextRecord;
export type CanvasObjectRecordFull = ShapeRecordFull | VectorRecordFull | TextRecordFull;
