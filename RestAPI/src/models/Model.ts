import {
  Types
} from "mongoose";

// === Model.ts ================================================================
//
// Defines interfaces and types that are in common for multiple models.
//
// =============================================================================

export interface DocumentBase {
  id: Types.ObjectId;
  _id?: Types.ObjectId;
}

export interface DocumentViewMethods<PublicViewType, AttribViewType> {
  toPublicView: () => PublicViewType;
  toAttribView: () => AttribViewType;
}
