// === CanvasObjectModel =======================================================
//
// Different types of shapes that can be drawn within a Canvas.
//
// =============================================================================

// i.e.
export type ShapeColor = string;

export interface CanvasObjectBase {
  strokeColor: ShapeColor;
  strokeWidth: number;
}

export interface ShapeModelBase extends CanvasObjectBase {
  x: number;
  y: number;
  fillColor: ShapeColor;
}

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

export interface VectorModel extends CanvasObjectBase {
  type: 'vector';
  points: number[];
}

export type CanvasObjectModel = RectModel | EllipseModel | VectorModel;
