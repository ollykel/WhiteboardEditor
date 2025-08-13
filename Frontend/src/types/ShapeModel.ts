// === ShapeModel ==============================================================
//
// Different types of shapes that can be drawn within a Canvas.
//
// =============================================================================

export interface RectModel {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EllipseModel {
  type: 'ellipse';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
}

export interface VectorModel {
  type: 'vector';
  points: number[];
}

export type ShapeModel = RectModel | EllipseModel | VectorModel;
