import {
  Types
} from "mongoose";

// === Model.ts ================================================================
//
// Defines interfaces and types that are in common for multiple models.
//
// =============================================================================

export interface DocumentVirtualBase {
  id: Types.ObjectId;
}

export type ViewDocument <ViewType> = DocumentVirtualBase & ViewType;

export interface DocumentViewMethods<PopulatedDocumentType, PublicViewType, AttribViewType> {
  populateAttribs: () => Promise<PopulatedDocumentType>;
  populateFull: () => Promise<PopulatedDocumentType>;
  toAttribView: () => AttribViewType;
  toPublicView: () => PublicViewType;
}
