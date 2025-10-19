import type { AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";

const AttributeStrokeWidth = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
  className,
}: AttributeProps) => {
  const onChangeStrokeColor = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const color = ev.target.value;
  
    dispatch({ type: 'SET_STROKE_COLOR', payload: color });
  
    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { strokeColor: color }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };
 
  return (
    <div>
      <label>Stroke Width</label>
      <input
        name="stroke-color"
        type="color"
        value={value}
        onChange={onChangeStrokeColor}
        className={className}
      />
    </div>
  );
}

export default AttributeStrokeWidth;