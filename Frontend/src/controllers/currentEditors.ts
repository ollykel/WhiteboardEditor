// -- local imports
import {
  type AppDispatch,
} from '@/store';

import {
  setCurrentEditorsByCanvas as setCurrentEditorsByCanvasReducer,
  removeCurrentEditors as removeCurrentEditorsReducer,
} from '@/store/activeUsers/currentEditorsByCanvasSlice.ts';

import {
  type ClientIdType,
  type CanvasIdType,
} from '@/types/WebSocketProtocol';

export const setCurrentEditorsByCanvas = (
  dispatch: AppDispatch,
  editorsByCanvas: Record<CanvasIdType, ClientIdType>
) => {
  dispatch(setCurrentEditorsByCanvasReducer(editorsByCanvas));
};

export const removeCurrentEditorsByCanvas = (
  dispatch: AppDispatch,
  clientIds: ClientIdType[]
) => {
  dispatch(removeCurrentEditorsReducer(clientIds));
};
