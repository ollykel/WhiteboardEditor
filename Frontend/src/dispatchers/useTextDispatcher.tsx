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
import draggableObjectProps from './editableObjectProps';

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
    _key: string | number,
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
        height
      } = model;

      return (
        <EditableText
          fontSize={fontSize}
          text={text}
          color={color}
          x={x}
          y={y}
          width={width}
          height={height}
          draggable={isDraggable}
          {...draggableObjectProps<TextModel>(model, isDraggable, handleUpdateShapes)}
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
    // handleUpdateShapes,
    getTooltipText,
  });
}

export default useTextDispatcher;