import { createSelector } from 'reselect'

// -- local imports
import type {
  CanvasObjectRecord,
  CanvasObjectIdType
} from '@/types/CanvasObjectModel';
import type {
  WhiteboardIdType,
  CanvasIdType
} from '@/types/WebSocketProtocol';

interface CanvasObjectsSliceState {
  canvasObjects: CanvasObjectRecord[];
}

const initialState: CanvasObjectsSliceState = {
  canvasObjects: []
};

export type CanvasObjectsAction =
  | {
    type: 'canvasObjects/add';
    payload: CanvasObjectRecord[];
  }
  | {
    type: 'canvasObjects/remove';
    payload: {
      whiteboardId: WhiteboardIdType;
      canvasId: CanvasIdType;
      objectId: CanvasObjectIdType;
    }
  }
  | {
    type: 'canvasObjects/update';
    payload: CanvasObjectRecord;
  };

const canvasObjectsReducer = (state = initialState, action: CanvasObjectsAction) => {
  switch (action.type) {
    case 'canvasObjects/add':
    {
      const newObjects = action.payload;

      return {
        ...state,
        canvasObjects: [
          ...state.canvasObjects,
          ...newObjects
        ]
      };
    }
    case 'canvasObjects/remove':
    {
      // TODO: check that unique identifiers are valid
      const { whiteboardId, canvasId, objectId } = action.payload;

      return {
        ...state,
        canvasObjects: state.canvasObjects.filter((objRecord) => (
          objRecord.id !== objectId
          || objRecord.whiteboardId !== whiteboardId
          || objRecord.canvasId !== canvasId
        ))
      };
    }
    case 'canvasObjects/update':
    {
      // objectId in this case is just an index into the array
      // TODO: check that key, objectId is valid
      const updatedObject = action.payload;
      const { id: objectId, whiteboardId, canvasId } = updatedObject;

      return {
        ...state,
        canvasObjects: state.canvasObjects.map((obj) => {
            if (obj.id === objectId && obj.whiteboardId === whiteboardId && obj.canvasId == canvasId) {
              return updatedObject;
            } else {
              return obj;
            }
        })
      };
    }
  }// end switch (action.type)
};// end canvasObjectsReducer

export const addCanvasObjects = (
  objects: CanvasObjectRecord[]
) => ({
    type: 'canvasObjects/add',
    payload: objects
});

export const removeCanvasObject = (
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType,
  objectId: number
) => ({
    type: 'canvasObjects/remove',
    payload: ({
      whiteboardId,
      canvasId,
      objectId
    })
});

export const updateCanvasObject = (
  object: CanvasObjectRecord
) => ({
    type: 'canvasObjects/remove',
    payload: object
});

export const selectCanvasObjects = createSelector(
  // select relevant data
  // directly used as output
  (state) => state.canvasObjects,

  // pass through unfiltered
  (canvasObjects) => canvasObjects
);

// Filter down to objects belonging to a particular canvas, the canvas being
// identified by both its own CanvasId as well as the WhiteboardId of the
// Whiteboard to which it belongs.
export const selectObjectsByCanvas = (
  state: CanvasObjectsSliceState,
  whiteboardId: WhiteboardIdType,
  canvasId: CanvasIdType
): CanvasObjectRecord[] => selectCanvasObjects(state).filter(
  (obj: CanvasObjectRecord) => (
    obj.whiteboardId === whiteboardId && obj.canvasId === canvasId
  )
);

export default canvasObjectsReducer;
