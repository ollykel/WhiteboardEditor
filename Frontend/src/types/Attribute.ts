// === Interface Attribute ====================================================
//
// The set of funcitons that forms each attribute
//
// Each attribute must handle :
//  
// 
//
// =============================================================================

import type { Dispatch } from "react";
import type { CanvasObjectIdType, CanvasObjectModel } from "./CanvasObjectModel";
import type { CanvasIdType } from "./WebSocketProtocol";
import type { ShapeAttributesAction, ShapeAttributesState } from "@/reducers/shapeAttributesReducer";

export type AttributeType =
  | "number"
  | "color"
  | "text";

export interface BaseAttribute<T> {
  name: string;
  type: AttributeType;
  value: T;
}

export interface NumberAttribute extends BaseAttribute<number> {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
}

export interface ColorAttribute extends BaseAttribute<string> {
  type: "color";
}

export interface TextAttribute extends BaseAttribute<string> {
  type: "text";
}

export type Attribute =
  | NumberAttribute
  | ColorAttribute
  | TextAttribute;

export interface AttributeProps {
  selectedShapeIds: CanvasObjectIdType[];
  handleUpdateShapes(canvasId: CanvasIdType, shapes: Record<CanvasObjectIdType, Partial<CanvasObjectModel>>): void;
  dispatch: Dispatch<ShapeAttributesAction>;
  canvasId: string;
  value: Attribute['value'];
  className: string;
}

export interface AttributeDefinition {
  name: string;
  Component: AttributeComponent;
  key: keyof ShapeAttributesState;
}

export type AttributeComponent = React.FC<AttributeProps>;