// === Interface Attribute ====================================================
//
// The set of funcitons that forms each attribute
//
// Each attribute must handle :
//  
// 
//
// =============================================================================

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

