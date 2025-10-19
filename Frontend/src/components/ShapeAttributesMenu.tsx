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
import { selectCanvasIdForShape } from '@/store/canvasObjects/canvasObjectsSelectors';
import type { RootState } from '@/store';

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
    currentDispatcher,
  } = whiteboardContext;

  // TODO: Change this for multiple select, right now only handles one shape
  const firstShapeId = selectedShapeIds[0];
  const canvasId = useSelector((state: RootState) => 
      selectCanvasIdForShape(state, whiteboardId, firstShapeId)
  );
  if (!firstShapeId || !canvasId || !currentDispatcher) return null;
  console.log("currentDispatcher: ", currentDispatcher);
  const AttributeComponents = currentDispatcher.getAttributes();

  return (
    <div className="max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md bg-stone-50">
      <h2 className="text-xl font-bold mb-2">Shape Attributes</h2>
      <form
        className="flex flex-col"
      >
        {AttributeComponents.map((Attr, i) => (
          <Attr 
            key={i}
            selectedShapeIds={selectedShapeIds}
            handleUpdateShapes={handleUpdateShapes}
            dispatch={dispatch}
            canvasId={canvasId}
            value={(attributes as any)[Attr.name.replace('Attribute', '').toLocaleLowerCase()]}
            className="rounded-lg border-gray-50"
          />
        ))}
      </form>
    </div>
  );
};// end ShapeAttributesMenu

export default ShapeAttributesMenu;

{/** stroke color **/}
{/* <label>Stroke Color</label>
<input
  name="stroke-color"
  type="color"
  value={strokeColor}
  onChange={onChangeStrokeColor}
/> */}
{/** fill color **/}
{/* <label>Fill Color</label>
<input
  name="fill-color"
  type="color"
  value={fillColor}
  onChange={onChangeFillColor}
/> */}