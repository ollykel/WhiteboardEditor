import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";

const FontSizeComponent = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
  className,
}: AttributeProps) => {
  const onChangeFontSize = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const size = parseInt(ev.target.value);
  
    dispatch({ type: 'SET_FONT_SIZE', payload: size });
  
    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { fontSize: size }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };
 
  return (
    <div>
      <label>Font Size</label>
      <input
        name="font-size"
        type="number"
        value={value}
        onChange={onChangeFontSize}
        className={className}
      />
    </div>
  );
}

const AttributeFontSize: AttributeDefinition = {
  name: "Font Size",
  key: "fontSize",
  Component: FontSizeComponent,
}

export default AttributeFontSize;