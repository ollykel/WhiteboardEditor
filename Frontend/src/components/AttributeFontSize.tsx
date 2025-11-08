import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";
import AttributeMenuItem from "./AttributeMenuItem";
import { useEffect, useState } from "react";

const FontSizeComponent = ({
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
  
  const onChangeFontSize = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const val = ev.target.value;
    setInputValue(val);

    const size = parseFloat(val);
    
    if (!isNaN(size)) {
      dispatch({ type: 'SET_FONT_SIZE', payload: size });
      handleUpdateShapes(
        canvasId,
        Object.fromEntries(selectedShapeIds.map(id => [id, { fontSize: size }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
      );  
    }
  };
 
  return (
    <div>
      <AttributeMenuItem title="Font Size">
        <input
          name="font-size"
          type="number"
          value={inputValue}
          onChange={onChangeFontSize}
          className="w-16 mr-0"
        />
      </AttributeMenuItem>
    </div>
  );
}

const AttributeFontSize: AttributeDefinition = {
  name: "Font Size",
  key: "fontSize",
  Component: FontSizeComponent,
}

export default AttributeFontSize;