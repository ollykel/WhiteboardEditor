import type { AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";

const AttributeFillColor = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
  className,
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
    <div>
      <label>Fill Color</label>
      <input
        name="fill-color"
        type="color"
        value={value}
        onChange={onChangeFillColor}
        className={className}
      />
    </div>
  );
}

export default AttributeFillColor;