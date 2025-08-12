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
import type { ShapeModel } from '@/types/ShapeModel';

export interface CanvasProps {
  width: number;
  height: number;
  shapes: ShapeModel[];
  onAddShapes: (shapes: ShapeModel[]) => void;
  currentTool: ToolChoice;
}

// For starters, just assume all rectangles have uniform width, height, and
// color.
interface EventCoords {
  x: number;
  y: number;
}

interface OperationDispatcherProps {
  addShapes: (shapes: ShapeModel[]) => void;
}

// === interface OperationDispatcher ===========================================
//
// A collection of functions that handle tool operations.
//
// Each tool operation must handle three Konva events:
//  - pointer down: The starting point of the operation should be determined
//  here (i.e. the initial point from which to draw a rectangle)
//  - pointer move: Triggered whenever the pointer moves while the mouse is
//  down. Should modify the state of preview and prepare the operation for its
//  final state.
//  - pointer up: Finishes the operation. Likely creates a shape, to be added to
//  the collection of shapes within the canvas.
//
//  The dispatcher should also provide a getPreview method, which indicates the
//  current state of the operation and the final shape that the user would draw
//  if they finish the operation at any given point (i.e. an outline of a
//  rectangle).
//
// =============================================================================
interface OperationDispatcher {
  handlePointerDown: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  handlePointerMove: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  handlePointerUp: (ev: Konva.KonvaEventObject<MouseEvent>) => void;
  getPreview: () => React.JSX.Element | null;
  renderShape: (key: string | number, model: ShapeModel) => React.JSX.Element | null;
  getTooltipText: () => string;
}

// === makeMockDispatcher ======================================================
//
// Use as a dummy for unimplemented functionalities.
//
// =============================================================================
const makeMockDispatcher = (_props: OperationDispatcherProps): OperationDispatcher => {
  return ({
    handlePointerDown: (_ev: Konva.KonvaEventObject<MouseEvent>) => {
      console.log('TODO: implement');
    },
    handlePointerMove: (_ev: Konva.KonvaEventObject<MouseEvent>) => {
      console.log('TODO: implement');
    },
    handlePointerUp: (_ev: Konva.KonvaEventObject<MouseEvent>) => {
      console.log('TODO: implement');
    },
    getPreview: () => null,
    renderShape: (_key: string | number, _model: ShapeModel) => null,
    getTooltipText: () => "TODO: implement"
  });
};

const makeRectangleDispatcher = ({ addShapes }: OperationDispatcherProps): OperationDispatcher => {
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

      addShapes([{ type: 'rect', x: xMin, y: yMin, width, height }]);
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

  const renderShape = (key: string | number, model: ShapeModel): React.JSX.Element | null => {
    if (model.type !== 'rect') {
      return null;
    } else {
      const { x, y, width, height } = model;

      return (
        <Rect
          key={key}
          x={x}
          y={y}
          width={width}
          height={height}
          fill="red"
          shadowBlur={10}
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
};// end makeRectangleDispatcher

const makeEllipseDispatcher = ({ addShapes }: OperationDispatcherProps): OperationDispatcher => {
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
        x: xOrigin,
        y: yOrigin,
        radiusX: Math.abs(xRelease - xOrigin),
        radiusY: Math.abs(yRelease - yOrigin)
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

  const renderShape = (key: string | number, model: ShapeModel): React.JSX.Element | null => {
    if (model.type !== 'ellipse') {
      return null;
    } else {
      const { x, y, radiusX, radiusY } = model;

      return (
        <Ellipse
          key={key}
          x={x}
          y={y}
          radiusX={radiusX}
          radiusY={radiusY}
          fill="red"
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
};// end makeEllipseDispatcher

const makeVectorDispatcher = ({ addShapes }: OperationDispatcherProps): OperationDispatcher => {
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

  const renderShape = (key: string | number, model: ShapeModel): React.JSX.Element | null => {
    if (model.type !== 'vector') {
      return null;
    } else {
      const { points } = model;

      return (
        <Line
          key={key}
          points={points}
          stroke="#000000"
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
};// end makeVectorDispatcher

const Canvas = (props: CanvasProps) => {
  const { width, height, shapes, onAddShapes, currentTool } = props;
  const stageRef = useRef<any>(null);

  // In the future, we may wrap onAddShapes with some other logic.
  // For now, it's just an alias.
  const addShapes = onAddShapes;
  
  const defaultDispatcher = makeMockDispatcher({ addShapes });
  const dispatcherMap = {
    'hand': defaultDispatcher,
    'rect': makeRectangleDispatcher({ addShapes }),
    'ellipse': makeEllipseDispatcher({ addShapes }),
    'vector': makeVectorDispatcher({ addShapes })
  };

  const dispatcher = dispatcherMap[currentTool] || defaultDispatcher;

  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    getPreview,
    getTooltipText
  } = dispatcher;

  return (
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
          shapes.filter((sh) => sh).map((shape: ShapeModel, idx: number) => {
            const renderDispatcher = dispatcherMap[shape.type] || defaultDispatcher;
            const { renderShape } = renderDispatcher;

            return renderShape(idx, shape);
          })
        }
      </Layer>
    </Stage>
  );
};

export default Canvas;
