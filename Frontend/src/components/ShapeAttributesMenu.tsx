import { useContext } from 'react';
import { useSelector } from 'react-redux';

import {
  type Dispatch,
} from 'react';

// -- local imports
import WhiteboardContext from '@/context/WhiteboardContext';
import type {
  ShapeAttributesState,
  ShapeAttributesAction
} from '@/reducers/shapeAttributesReducer';
import { getShapeType, selectCanvasIdForShape, selectCanvasObjectById } from '@/store/canvasObjects/canvasObjectsSelectors';
import type { RootState } from '@/store';
import { getAttributesByShape, type AttributeDefinition } from '@/types/Attribute';
import type { CanvasObjectModel } from '@/types/CanvasObjectModel';

export interface ShapeAttributesMenuProps {
  attributes: ShapeAttributesState;
  dispatch: Dispatch<ShapeAttributesAction>;
}

const ShapeAttributesMenu = (props: ShapeAttributesMenuProps) => {
  const { attributes, dispatch } = props;

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No whiteboard context');
  }

  const {
    selectedShapeIds,
    handleUpdateShapes,
    whiteboardId,
    currentTool,
    currentDispatcher,
    selectedCanvasId,
  } = whiteboardContext;

  // TODO: Change this for multiple select, right now only handles one shape
  const firstShapeId = selectedShapeIds[0];

  let canvasId = useSelector((state: RootState) => 
    firstShapeId ? selectCanvasIdForShape(state, whiteboardId, firstShapeId): undefined
  );
  const shapeType = useSelector((state: RootState) => 
    canvasId && firstShapeId ? getShapeType(state, whiteboardId, canvasId, firstShapeId) : undefined
  );
  const firstShape = useSelector((state: RootState) =>
    firstShapeId && canvasId
      ? selectCanvasObjectById(state, whiteboardId, canvasId, firstShapeId)
      : undefined
  );

  if (currentTool === 'create_canvas') return null;

  if (!canvasId) {
    if (!selectedCanvasId) {
      return null;
    }
    canvasId = selectedCanvasId;
  }
  
  let AttributeComponents: AttributeDefinition[];

  if (currentTool === "hand" && shapeType) {
    // Shape edit mode
    AttributeComponents = getAttributesByShape(shapeType);
  }
  else {
    // Tool mode
    console.log("tool mode", currentDispatcher, currentTool);
    if (!currentDispatcher || currentTool == "hand") return null;
    AttributeComponents = currentDispatcher.getAttributes();
  }

  return (
    <div className="max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md bg-stone-50">
      <h2 className="text-xl font-bold mb-2">Shape Attributes</h2>
      <form
        className="flex flex-col"
        onSubmit={(ev: React.FormEvent<HTMLFormElement>) => {
          ev.preventDefault();
        }}
      >
        {AttributeComponents.map(({ Component, key }) => (
          <Component
            key={key}
            selectedShapeIds={selectedShapeIds}
            handleUpdateShapes={handleUpdateShapes}
            dispatch={dispatch}
            canvasId={canvasId}
            value={firstShape ? firstShape[key as keyof CanvasObjectModel] : attributes[key]}
            className="rounded-lg border-gray-50"
          />
        ))}
      </form>
    </div>
  );
};// end ShapeAttributesMenu

export default ShapeAttributesMenu;
