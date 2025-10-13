import { useContext } from 'react';
import { useSelector } from 'react-redux';

// -- local imports
import WhiteboardContext from '@/context/WhiteboardContext';
import type {
  ShapeAttributesState,
  ShapeAttributesAction
} from '@/reducers/shapeAttributesReducer';
import { selectCanvasIdForShape } from '@/store/canvasObjects/canvasObjectsSelectors';
import type { RootState } from '@/store';
import type { CanvasObjectIdType, CanvasObjectModel } from '@/types/CanvasObjectModel';

export interface ShapeAttributesMenuProps {
  attributes: ShapeAttributesState;
  dispatch: React.Dispatch<ShapeAttributesAction>;
}

const ShapeAttributesMenu = (props: ShapeAttributesMenuProps) => {
  const { attributes, dispatch } = props;
  const { strokeWidth, strokeColor, fillColor } = attributes;

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No whiteboard context');
  }

  const {
    selectedShapeIds,
    handleUpdateShapes,
    whiteboardId,
  } = whiteboardContext;

  // TODO: Change this for multiple select, right now only handles one shape
  const firstShapeId = selectedShapeIds[0];
  const canvasId = useSelector((state: RootState) => 
      selectCanvasIdForShape(state, whiteboardId, firstShapeId)
  );
  if (!firstShapeId) return;
  if (!canvasId) return;

  // This isn't a proper form, since there's nothing to submit.
  // Updates are dispatched every time an input is changed.
  const onChangeStrokeWidth = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const width = parseInt(ev.target.value);

    dispatch({ type: 'SET_STROKE_WIDTH', payload: width });

    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { strokeWidth: width }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };

  const onChangeStrokeColor = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const color = ev.target.value.toString();

    dispatch({ type: 'SET_STROKE_COLOR',  payload: color });

    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { strokeColor: color }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    ); 
  };

  const onChangeFillColor = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const color = ev.target.value.toString();
    
    dispatch({ type: 'SET_FILL_COLOR', payload: color });

    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { fillColor: color }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );
  };

  return (
    <div className="max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md bg-stone-50">
      <h2 className="text-xl font-bold mb-2">Shape Attributes</h2>
      <form
        onSubmit={(ev: React.FormEvent<HTMLFormElement>) => {
          ev.preventDefault();
        }}
        className="flex flex-col"
      >
        {/** stroke width **/}
        <label>Stroke Width</label>
        <input
          name="stroke-width"
          type="number"
          min={1}
          step={0.5}
          value={strokeWidth}
          onChange={onChangeStrokeWidth}
          className="rounded-lg border-gray-50"
        />
        {/** stroke color **/}
        <label>Stroke Color</label>
        <input
          name="stroke-color"
          type="color"
          value={strokeColor}
          onChange={onChangeStrokeColor}
        />
        {/** fill color **/}
        <label>Fill Color</label>
        <input
          name="fill-color"
          type="color"
          value={fillColor}
          onChange={onChangeFillColor}
        />
      </form>
    </div>
  );
};// end ShapeAttributesMenu

export default ShapeAttributesMenu;
