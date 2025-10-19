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
import type { AttributeDefinition } from '@/types/Attribute';
import AttributeStrokeWidth from '@/components/AttributeStrokeWidth';
import AttributeStrokeColor from '@/components/AttributeStrokeColor';
import AttributeFillColor from '@/components/AttributeFillColor';

// === useRectangleDispatcher ==================================================
//
// Tool for drawing rectangles.
//
// =============================================================================
const useRectangleDispatcher = ({
  shapeAttributes,
  addShapes
}: OperationDispatcherProps<null>
): OperationDispatcher => {
  const [mouseDownCoords, setMouseDownCoords] = useState<EventCoords | null>(null);
  const [mouseCoords, setMouseCoords] = useState<EventCoords | null>(null);

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = ev.currentTarget.getRelativePointerPosition();

    if (pos) {
      const { x, y } = pos;

      setMouseDownCoords({ x, y });
      setMouseCoords({ x, y });
    }
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = ev.currentTarget.getRelativePointerPosition();

    if (pos) {
      const { x, y } = pos;

      setMouseCoords({ x, y });
    }
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = ev.currentTarget.getRelativePointerPosition();

    if (pos && mouseDownCoords) {
      const { x: xA, y: yA } = pos;
      const { x: xB, y: yB } = mouseDownCoords;
      const xMin = Math.min(xA, xB);
      const yMin = Math.min(yA, yB);
      const width = Math.abs(xA - xB);
      const height = Math.abs(yA - yB);

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

  const getAttributes = (): AttributeDefinition[] => {
    return [
      AttributeStrokeWidth,
      AttributeStrokeColor,
      AttributeFillColor,
    ];
  }

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
    getAttributes,
    renderShape,
    getTooltipText,
  });
};// end useRectangleDispatcher

export default useRectangleDispatcher;
