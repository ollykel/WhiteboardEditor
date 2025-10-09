import React, {
  useState
} from 'react';

import Konva from 'konva';
import { Rect } from 'react-konva';

import EditableText from '@/components/EditableText';

import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  CanvasObjectIdType,
  CanvasObjectModel,
  TextModel
} from '@/types/CanvasObjectModel';
import type {
  EventCoords
} from '@/types/EventCoords';
import editableObjectProps from './editableObjectProps';

// === useTextDispatcher ==================================================
//
// Tool for writing text.
//
// =============================================================================
const useTextDispatcher = ({
  // shapeAttributes,
  addShapes,
}: OperationDispatcherProps
): OperationDispatcher => {
  const [mouseDownCoords, setMouseDownCoords] = useState<EventCoords | null>(null);
  const [mouseCoords, setMouseCoords] = useState<EventCoords | null>(null);

  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
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
    ev.cancelBubble = true;

    if (mouseDownCoords !== null) {
    const { x: targetX, y: targetY } = ev.currentTarget.getPosition();
      const { offsetX, offsetY } = ev.evt;
      const xA = offsetX - targetX;
      const yA = offsetY - targetY;
      const { x: xB, y: yB } = mouseDownCoords;
      const xMin = Math.min(xA, xB);
      const yMin = Math.min(yA, yB);
      const width = Math.abs(xA - xB);
      const height = Math.abs(yA - yB);

      addShapes([{
        type: 'text',
        text: 'Text',
        fontSize: 20,
        color: 'black',
        x: xMin,
        y: yMin,
        width,
        height,
        rotation: 0,
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
    if (model.type !== 'text') {
      return null;
    } else {
      const {
        fontSize,
        text,
        color,
        x,
        y,
        width,
        height,
        rotation,
      } = model;

      return (
        <EditableText
          key={key}
          id={`${key}`}
          fontSize={fontSize}
          text={text}
          color={color}
          x={x}
          y={y}
          width={width}
          height={height}
          draggable={isDraggable}
          rotation={rotation}
          shapeModel={model}
          handleUpdateShapes={handleUpdateShapes}
          {...editableObjectProps<TextModel>(model, isDraggable, handleUpdateShapes)}
        />
      )
    }
  };

  const getTooltipText = () => {
    if (mouseDownCoords) {
      return 'Drag to desired textbox size, then release';
    } else {
      return 'Click to draw a textbox';
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
}

export default useTextDispatcher;
