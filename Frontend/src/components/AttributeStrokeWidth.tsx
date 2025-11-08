import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";
import AttributeMenuItem from "./AttributeMenuItem";
import { useEffect, useState } from "react";

const StrokeWidthComponent = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
}: AttributeProps) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const onChangeStrokeWidth = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const val = ev.target.value;
    setInputValue(val);

    const widthParsed = parseFloat(val);  
    
    if (!isNaN(widthParsed)) {
      dispatch({ type: 'SET_STROKE_WIDTH', payload: widthParsed });
      handleUpdateShapes(
        canvasId,
        Object.fromEntries(selectedShapeIds.map(id => [id, { strokeWidth: widthParsed }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
      );  
    }
  };
 
  return (
    <div>
      <AttributeMenuItem title="Stroke Width">
        <input
          name="stroke-width"
          type="number"
          min={1}
          step={0.5}
          value={inputValue}
          onChange={onChangeStrokeWidth}
          className="w-16 mr-0"
        />
      </AttributeMenuItem>
    </div>
  );
}

const AttributeStrokeWidth: AttributeDefinition = {
  name: "Stroke Width",
  key: "strokeWidth",
  Component: StrokeWidthComponent,
}

export default AttributeStrokeWidth;
