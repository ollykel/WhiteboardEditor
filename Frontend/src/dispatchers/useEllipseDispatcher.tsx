// --- std imports
import { useState } from 'react';

// --- third-party imports
import Konva from 'konva';
import { Ellipse } from 'react-konva';

// --- local imports
import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel
} from '@/types/CanvasObjectModel';
import type {
  EventCoords
} from '@/types/EventCoords';

import draggableObjectProps from './draggableObjectProps';

// === useEllipseDispatcher ====================================================
//
// Tool for drawing ellipses.
//
// =============================================================================
const useEllipseDispatcher = ({
  shapeAttributes,
  addShapes
}: OperationDispatcherProps
): OperationDispatcher => {
  const [mouseDownCoords, setMouseDownCoords] = useState<EventCoords | null>(null);
  const [mouseCoords, setMouseCoords] = useState<EventCoords | null>(null);

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX, offsetY } = ev.evt;

    setMouseDownCoords({ x: offsetX, y: offsetY });
    setMouseCoords({ x: offsetX, y: offsetY });
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX, offsetY } = ev.evt;

    setMouseCoords({ x: offsetX, y: offsetY });
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    if (mouseDownCoords !== null) {
      const { offsetX: xRelease, offsetY: yRelease } = ev.evt;
      const { x: xOrigin, y: yOrigin } = mouseDownCoords;

      addShapes([{
        type: 'ellipse',
        ...shapeAttributes,
        x: xOrigin,
        y: yOrigin,
        radiusX: Math.abs(xRelease - xOrigin),
        radiusY: Math.abs(yRelease - yOrigin),
      }]);
      setMouseDownCoords(null);
    }
  };

  const getPreview = (): React.JSX.Element | null => {
    if (mouseDownCoords && mouseCoords) {
      const { x: xOrigin, y: yOrigin } = mouseDownCoords;
      const { x: xCurr, y: yCurr } = mouseCoords;

      return (
        <Ellipse
          x={xOrigin}
          y={yOrigin}
          radiusX={Math.abs(xCurr - xOrigin)}
          radiusY={Math.abs(yCurr - yOrigin)}
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
    if (model.type !== 'ellipse') {
      return null;
    } else {
      const { x, y, radiusX, radiusY, fillColor, strokeColor, strokeWidth } = model;

      return (
        <Ellipse
          key={key}
          id={`${key}`}
          x={x}
          y={y}
          radiusX={radiusX}
          radiusY={radiusY}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          draggable={isDraggable}
          {...draggableObjectProps(model, isDraggable, handleUpdateShapes)}
        />
      );
    }
  };

  const getTooltipText = () => {
    if (mouseDownCoords) {
      return 'Drag to desired shape, then release';
    } else {
      return 'Click to draw an ellipse';
    }
  };

  return ({
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPreview,
    renderShape,
    getTooltipText
  });
};// end useEllipseDispatcher

export default useEllipseDispatcher;
