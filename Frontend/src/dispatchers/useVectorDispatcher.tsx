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
  VectorModel,
} from '@/types/CanvasObjectModel';
import type {
  EventCoords
} from '@/types/EventCoords';
import EditableVector from '@/components/EditableVector';
import { getAttributesByShape, type AttributeDefinition } from '@/types/Attribute';

// === useVectorDispatcher =====================================================
//
// Tool for drawing vectors.
//
// =============================================================================
const useVectorDispatcher = ({
  shapeAttributes,
  onStartEditing,
  addShapes,
}: OperationDispatcherProps<null>
): OperationDispatcher => {
  const [mouseDownCoords, setMouseDownCoords] = useState<EventCoords | null>(null);
  const [mouseCoords, setMouseCoords] = useState<EventCoords | null>(null);

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
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

    if (onStartEditing) {
      onStartEditing();
    }
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { x: targetX, y: targetY } = ev.currentTarget.getPosition();
    const { offsetX, offsetY } = ev.evt;

    setMouseCoords({
      x: offsetX - targetX,
      y: offsetY - targetY
    });
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    if (mouseDownCoords !== null) {
      const { x: targetX, y: targetY } = ev.currentTarget.getPosition();
      const { offsetX, offsetY } = ev.evt;
      const { x: xB, y: yB } = mouseDownCoords;

      const xA = offsetX - targetX;
      const yA = offsetY - targetY;

      addShapes([{
        type: 'vector',
        ...shapeAttributes,
        points: [xB, yB, xA, yA]
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
    handleUpdateShapes: (shapes: Record<CanvasObjectIdType, CanvasObjectModel>) => void
  ): React.JSX.Element | null => {
    if (model.type !== 'vector') {
      return null;
    } else {
      const { strokeColor, strokeWidth, points } = model;

      return (
        <EditableVector<VectorModel>
          key={key}
          id={`${key}`}
          draggable={isDraggable}
          shapeModel={model}
          handleUpdateShapes={handleUpdateShapes}
        >
          <Line
            points={points}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </EditableVector>
      );
    }
  };

  const getAttributes = (): AttributeDefinition[] => getAttributesByShape('vector');

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
    getAttributes,
    renderShape,
    getTooltipText
  });
};// end useVectorDispatcher

export default useVectorDispatcher;
