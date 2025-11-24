// === RootState ===============================================================
//
// Defines objects stored within the central state store.
//
// =============================================================================

import {
  type UserIdType,
  type CanvasAttribs as WSPCanvasAttribs,
  type CanvasData as WSPCanvasData,
} from '@/types/WebSocketProtocol';

interface CanvasAttribsExtension {
  currentEditorUserId?: UserIdType;
}

export type CanvasAttribs = WSPCanvasAttribs & CanvasAttribsExtension;

export type CanvasData = WSPCanvasData & CanvasAttribsExtension;
