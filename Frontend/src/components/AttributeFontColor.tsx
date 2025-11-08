import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";
import AttributeLabel from "./AttributeLabel";

const FontColorComponent = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
  className,
}: AttributeProps) => {
  const onChangeFontColor = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const color = ev.target.value;
  
    dispatch({ type: 'SET_FONT_COLOR', payload: color });
  
    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { color: color }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };
 
  return (
    <div>
      <AttributeLabel>Font Color</AttributeLabel>
      <input
        name="font-color"
        type="color"
        value={value}
        onChange={onChangeFontColor}
        className={className}
      />
    </div>
  );
}

const AttributeFontColor: AttributeDefinition = {
  name: "Font Color",
  key: "color",
  Component: FontColorComponent,
}

export default AttributeFontColor;