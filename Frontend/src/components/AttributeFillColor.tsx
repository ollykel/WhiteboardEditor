import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";
import AttributeMenuItem from "./AttributeMenuItem";

const FillColorComponent = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
}: AttributeProps) => {
  const onChangeFillColor = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const color = ev.target.value;
  
    dispatch({ type: 'SET_FILL_COLOR', payload: color });
  
    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { fillColor: color }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };
 
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