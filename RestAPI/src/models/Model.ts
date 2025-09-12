import {
  Document,
  Types
} from "mongoose";

// === Model.ts ================================================================
//
// Defines interfaces and types that are in common for multiple models.
//
// =============================================================================

export interface DocumentBase extends Document {
  _id: Types.ObjectId;
}
