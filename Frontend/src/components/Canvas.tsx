// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// Makes use of react-konva. For documentation, see
// https://konvajs.org/docs/react/index.html.
//
// =============================================================================

import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Ellipse, Line, Text } from 'react-konva';
import Konva from 'konva';

// -- local imports
import type { ToolChoice } from '@/components/Tool';
import type {
  CanvasObjectModel
} from '@/types/CanvasObjectModel';
import type {
  ShapeAttributesState
} from '@/reducers/shapeAttributesReducer';
import type {
  OperationDispatcher,
  OperationDispatcherProps
} from '@/types/OperationDispatcher';
import type {
  EventCoords
} from '@/types/EventCoords';

// -- dispatchers
import useMockDispatcher from '@/dispatchers/useMockDispatcher';
import useInaccessibleDispatcher from '@/dispatchers/useInaccessibleDispatcher';

export interface CanvasProps {
  width: number;
  height: number;
  shapes: CanvasObjectModel[];
  onAddShapes: (shapes: CanvasObjectModel[]) => void;
  shapeAttributes: ShapeAttributesState;
  currentTool: ToolChoice;
  disabled: boolean;
}

const useRectangleDispatcher = ({ shapeAttributes, addShapes }: OperationDispatcherProps): OperationDispatcher => {
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
    model: CanvasObjectModel
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
        height
      } = model;

      return (
        <Rect
          key={key}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
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
    getTooltipText
  });
};// end useRectangleDispatcher

const useEllipseDispatcher = ({ shapeAttributes, addShapes }: OperationDispatcherProps): OperationDispatcher => {
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
    model: CanvasObjectModel
  ): React.JSX.Element | null => {
    if (model.type !== 'ellipse') {
      return null;
    } else {
      const { x, y, radiusX, radiusY, fillColor, strokeColor, strokeWidth } = model;

      return (
        <Ellipse
          key={key}
          x={x}
          y={y}
          radiusX={radiusX}
          radiusY={radiusY}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
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

const useVectorDispatcher = ({ shapeAttributes, addShapes }: OperationDispatcherProps): OperationDispatcher => {
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
    model: CanvasObjectModel
  ): React.JSX.Element | null => {
    if (model.type !== 'vector') {
      return null;
    } else {
      const { strokeColor, strokeWidth, points } = model;

      return (
        <Line
          key={key}
          points={points}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
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

const Canvas = (props: CanvasProps) => {
  const {
    width,
    height,
    shapes,
    onAddShapes,
    shapeAttributes,
    currentTool,
    disabled
  } = props;
  const stageRef = useRef<Konva.Stage | null>(null);

  // In the future, we may wrap onAddShapes with some other logic.
  // For now, it's just an alias.
  const addShapes = onAddShapes;
  
  const defaultDispatcher = useMockDispatcher({
    shapeAttributes,
    addShapes
  });
  const inaccessibleDispatcher = useInaccessibleDispatcher({
    shapeAttributes,
    addShapes
  });

  const dispatcherMap = {
    'hand': defaultDispatcher,
    'rect': useRectangleDispatcher({
      shapeAttributes,
      addShapes
    }),
    'ellipse': useEllipseDispatcher({
      shapeAttributes,
      addShapes
    }),
    'vector': useVectorDispatcher({
      shapeAttributes,
      addShapes
    })
  };

  let dispatcher: OperationDispatcher;

  if (disabled) {
    dispatcher = inaccessibleDispatcher;
  } else {
    dispatcher = dispatcherMap[currentTool] || defaultDispatcher;
  }

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPreview,
    getTooltipText
  } = dispatcher;

  return (
    <>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onPointerdown={handlePointerDown}
        onPointermove={handlePointerMove}
        onPointerup={handlePointerUp}
      >
        <Layer>
          <Text
            text={getTooltipText()}
            fontSize={15}
          />
          {/** Preview Shape **/}
          {getPreview()}

          {/** Shapes **/}
          {
            shapes.filter((sh) => sh).map((shape: CanvasObjectModel, idx: number) => {
              const renderDispatcher = dispatcherMap[shape.type] || defaultDispatcher;
              const { renderShape } = renderDispatcher;

              return renderShape(idx, shape);
            })
          }
        </Layer>
      </Stage>
    </>
  );
};

export default Canvas;
