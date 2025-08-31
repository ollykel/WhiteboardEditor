// === CanvasObjectModel =======================================================
//
// Different types of shapes that can be drawn within a Canvas.
//
// =============================================================================

export interface ShapeModelBase {
  x: number;
  y: number;
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

export interface VectorModel {
  type: 'vector';
  points: number[];
}

export type CanvasObjectModel = RectModel | EllipseModel | VectorModel;
