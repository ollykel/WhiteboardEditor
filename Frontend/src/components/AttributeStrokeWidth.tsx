import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";
import AttributeLabel from "./AttributeLabel";

const StrokeWidthComponent = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
  className,
}: AttributeProps) => {
  const onChangeStrokeWidth = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const widthParsed = parseInt(ev.target.value);
    const width = isNaN(widthParsed) ? 0 : widthParsed;
  
    dispatch({ type: 'SET_STROKE_WIDTH', payload: width });
  
    handleUpdateShapes(
      canvasId,
      Object.fromEntries(selectedShapeIds.map(id => [id, { strokeWidth: width }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
    );  
  };
 
  return (
    <div>
      <AttributeLabel>Stroke Width</AttributeLabel>
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

const AttributeStrokeWidth: AttributeDefinition = {
  name: "Stroke Width",
  key: "strokeWidth",
  Component: StrokeWidthComponent,
}

export default AttributeStrokeWidth;
