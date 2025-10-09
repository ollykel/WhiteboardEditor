// --- std imports
import { useState } from 'react';

// --- third-party imports
import Konva from 'konva';
import { Rect } from 'react-konva';

// --- local imports
import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel,
  RectModel
} from '@/types/CanvasObjectModel';
import type {
  EventCoords
} from '@/types/EventCoords';

import EditableShape from '@/components/EditableShape';

// === useRectangleDispatcher ==================================================
//
// Tool for drawing rectangles.
//
// =============================================================================
const useRectangleDispatcher = ({
  shapeAttributes,
  addShapes
}: OperationDispatcherProps
): OperationDispatcher => {
  const [mouseDownCoords, setMouseDownCoords] = useState<EventCoords | null>(null);
  const [mouseCoords, setMouseCoords] = useState<EventCoords | null>(null);

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    console.log('!! PointerDown event:', ev);// TODO: remove debug
    ev.cancelBubble = true;

    const { x: targetX, y: targetY } = ev.currentTarget.getPosition();
    const { offsetX, offsetY } = ev.evt;

    setMouseDownCoords({
      x: offsetX - targetX,
      y: offsetY - targetY
    });
    setMouseCoords({
      x: offsetX - targetX,
      y: offsetY - targetY
    });
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    ev.cancelBubble = true;

    const { x: targetX, y: targetY } = ev.currentTarget.getPosition();
    const { offsetX, offsetY } = ev.evt;

    setMouseCoords({
      x: offsetX - targetX,
      y: offsetY - targetY
    });
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    console.log('!! PointerUp event:', ev);// TODO: remove debug
    ev.cancelBubble = true;

    if (mouseDownCoords) {
      const { x: targetX, y: targetY } = ev.currentTarget.getPosition();
      const { offsetX: xA, offsetY: yA } = ev.evt;
      const { x: xB, y: yB } = mouseDownCoords;
      const xMin = Math.min(xA - targetX, xB);
      const yMin = Math.min(yA - targetY, yB);
      const width = Math.abs(xA - targetX - xB);
      const height = Math.abs(yA - targetY - yB);

      addShapes([{
        type: 'rect',
        ...shapeAttributes,
        x: xMin,
        y: yMin,
        width,
        height
      }]);
      setMouseDownCoords(null);
    }
  };

  const getPreview = (): React.JSX.Element | null => {
    if (mouseDownCoords && mouseCoords) {
      const { x: xA, y: yA } = mouseDownCoords;
      const { x: xB, y: yB } = mouseCoords;

      return (
        <Rect
          x={Math.min(xA, xB)}
          y={Math.min(yA, yB)}
          width={Math.abs(xA - xB)}
          height={Math.abs(yA - yB)}
          fill="#ffaaaa"
        />
      );
    } else {
      return null;
    }
  };

  const renderShape = (
    key: string | number,
    model: CanvasObjectModel,
    isDraggable: boolean,
    handleUpdateShapes: (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => void
  ): React.JSX.Element | null => {
    if (model.type !== 'rect') {
      return null;
    } else {
      const {
        x,
        y,
        fillColor,
        strokeColor,
        strokeWidth,
        width,
        height,
        rotation,
      } = model;

      return (
        <EditableShape<RectModel>
          key={key}
          id={`${key}`}
          draggable={isDraggable}
          shapeModel={model}
          handleUpdateShapes={handleUpdateShapes}
        >
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rotation={rotation}
          />
        </EditableShape>
      );
    }
  };

  const getTooltipText = () => {
    if (mouseDownCoords) {
      return 'Drag to desired shape, then release';
    } else {
      return 'Click to draw a rectangle';
    }
  };

  return ({
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPreview,
    renderShape,
    getTooltipText,
  });
};// end useRectangleDispatcher

export default useRectangleDispatcher;
