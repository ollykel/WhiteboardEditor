

const onChangeStrokeWidth = (ev: React.ChangeEvent<HTMLInputElement>) => {
  ev.preventDefault();
  const width = parseInt(ev.target.value);

  dispatch({ type: 'SET_STROKE_WIDTH', payload: width });

  handleUpdateShapes(
    canvasId,
    Object.fromEntries(selectedShapeIds.map(id => [id, { strokeWidth: width }])) as Record<CanvasObjectIdType, Partial<CanvasObjectModel>>
  );  
};

const AttributeStrokeWidth = () => {
  return (
    <div>
      <label>Stroke Width</label>
      <input
        name="stroke-width"
        type="number"
        min={1}
        step={0.5}
        value={strokeWidth}
        onChange={onChangeStrokeWidth}
        className="rounded-lg border-gray-50"
      />
    </div>
  );
}

export default AttributeStrokeWidth;