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
  const onChangeStrokeWidth = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const width = parseInt(ev.target.value);
  
    dispatch({ type: 'SET_STROKE_WIDTH', payload: width });
  
    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { strokeWidth: width }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };

  console.log("in AttributeStrokeWidth"); // debugging
 
  return (
    <div>
      <label>Stroke Width</label>
      <input
        name="stroke-width"
        type="number"
        min={1}
        step={0.5}
        value={value}
        onChange={onChangeStrokeWidth}
        className={className}
      />
    </div>
  );
}

export default AttributeStrokeWidth;