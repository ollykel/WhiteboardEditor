// --- std imports
import { useState } from 'react';

// --- third-party imports
import Konva from 'konva';
import { Line } from 'react-konva';

// --- local imports
import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel,
  VectorModel
} from '@/types/CanvasObjectModel';
import type {
  EventCoords
} from '@/types/EventCoords';

// === useVectorDispatcher =====================================================
//
// Tool for drawing vectors.
//
// =============================================================================
const useVectorDispatcher = ({
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
      const { offsetX: xA, offsetY: yA } = ev.evt;
      const { x: xB, y: yB } = mouseDownCoords;

      addShapes([{
        type: 'vector',
        ...shapeAttributes,
        points: [xA, yA, xB, yB]
      }]);
      setMouseDownCoords(null);
    }
  };

  const getPreview = (): React.JSX.Element | null => {
    if (mouseDownCoords && mouseCoords) {
      const { x: xA, y: yA } = mouseDownCoords;
      const { x: xB, y: yB } = mouseCoords;

      return (
        <Line
          points={[xA, yA, xB, yB]}
          stroke="#888888"
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
    _handleUpdateShapes: (shapes: Record<CanvasObjectIdType, VectorModel>) => void
  ): React.JSX.Element | null => {
    if (model.type !== 'vector') {
      return null;
    } else {
      const { strokeColor, strokeWidth, points } = model;

      return (
        <Line
          key={key}
          id={`${key}`}
          points={points}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          draggable={isDraggable}
          onMouseOver={undefined}
          onMouseOut={undefined}
          onMouseDown={undefined}
          onMouseUp={undefined}
          onDragEnd={undefined}
        />
      );
    }
  };

  const getTooltipText = () => {
    if (mouseDownCoords) {
      return 'Drag to desired length, then release';
    } else {
      return 'Click to draw a vector';
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
};// end useVectorDispatcher

export default useVectorDispatcher;
