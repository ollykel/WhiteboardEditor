// -- std imports
import {
  useContext,
  useCallback,
} from 'react';

// -- local imports
import {
  type AttributeDefinition,
  type AttributeProps,
} from "@/types/Attribute";

import {
  type CanvasObjectIdType,
  type CanvasObjectModel,
} from "@/types/CanvasObjectModel";

import WhiteboardContext from '@/context/WhiteboardContext';

import AttributeMenuItem from "./AttributeMenuItem";

const FillColorComponent = ({
  selectedShapeIds, 
  dispatch, 
  canvasId, 
  value,
}: AttributeProps) => {
  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No Whiteboard context provided to AttributeFillColor');
  }

  const {
    handleUpdateShapes,
  } = whiteboardContext;

  const onChangeFillColor = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      ev.preventDefault();

      const color = ev.target.value;
    
      dispatch({ type: 'SET_FILL_COLOR', payload: color });
    
      handleUpdateShapes(
        canvasId,
        Object.fromEntries(selectedShapeIds.map(id => [id, { fillColor: color }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
      );  
    },
    [dispatch, handleUpdateShapes]
  );
 
  return (
    <AttributeMenuItem title="Fill Color">
      <input
        name="fill-color"
        type="color"
        value={value}
        onChange={onChangeFillColor}
        className=""
      />
    </AttributeMenuItem> 
  );
}

const AttributeFillColor: AttributeDefinition = {
  name: "Fill Color",
  key: "fillColor",
  Component: FillColorComponent,
}

export default AttributeFillColor;
