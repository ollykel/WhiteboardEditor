import type { AttributeDefinition, AttributeProps } from "@/types/Attribute";
import type { CanvasObjectIdType, CanvasObjectModel } from "@/types/CanvasObjectModel";
import AttributeMenuItem from "./AttributeMenuItem";

const StrokeWidthComponent = ({
  selectedShapeIds, 
  handleUpdateShapes, 
  dispatch, 
  canvasId, 
  value,
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
      <AttributeMenuItem title="Stroke Width">
        <input
          name="stroke-width"
          type="number"
          min={1}
          step={0.5}
          value={value}
          onChange={onChangeStrokeWidth}
          className="w-15 mr-0"
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
