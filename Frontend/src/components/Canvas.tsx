// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// Makes use of react-konva. For documentation, see
// https://konvajs.org/docs/react/index.html.
//
// =============================================================================

import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

// -- local imports
import type { ToolChoice } from '@/components/Tool';

export interface CanvasProps {
  width: number;
  height: number;
  currentTool: ToolChoice;
}

// For starters, just assume all rectangles have uniform width, height, and
// color.
interface EventCoords {
  x: number;
  y: number;
}

interface RectModel {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface VectorModel {
  type: 'vector';
  points: number[];
}

type ShapeModel = RectModel | VectorModel;

interface NilShapeState {
  type: 'nil';
}

interface RectState {
  type: 'rect';
  mouseDownCoords: EventCoords | null;
  mouseCoords: EventCoords | null;
}

type ShapeState = NilShapeState | RectState;

interface OperationDispatcherProps {
  state: ShapeState;
  setState: (stateSetter: ShapeState) => void;
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
    getTooltipText: () => "TODO: implement"
  });
};

const makeRectangleDispatcher = ({ state, setState, addShapes }: OperationDispatcherProps): OperationDispatcher => {
  const handlePointerDown = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    const { offsetX, offsetY } = ev.evt;

    setState({
      type: 'rect',
      mouseDownCoords: ({ x: offsetX, y: offsetY }),
      mouseCoords: ({ x: offsetX, y: offsetY })
    });
  };

  const handlePointerMove = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.type === 'rect') {
      const { offsetX, offsetY } = ev.evt;

      setState({
        ...state,
        mouseCoords: ({ x: offsetX, y: offsetY })
      });
    }
  };

  const handlePointerUp = (ev: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.type === 'rect') {
      const { offsetX: xA, offsetY: yA } = ev.evt;
      const { mouseDownCoords } = state;

      if (mouseDownCoords !== null) {
        const { x: xB, y: yB } = mouseDownCoords;
        const xMin = Math.min(xA, xB);
        const yMin = Math.min(yA, yB);
        const width = Math.abs(xA - xB);
        const height = Math.abs(yA - yB);

        addShapes([{ type: 'rect', x: xMin, y: yMin, width, height }]);
      }

      setState({
        ...state,
        mouseDownCoords: null
      });
    }
  };

  const getPreview = (): React.JSX.Element | null => {
    if (state.type === 'rect') {
      const { mouseDownCoords, mouseCoords } = state;

      return (mouseCoords && mouseDownCoords && (
        <Rect
          x={Math.min(mouseCoords.x, mouseDownCoords.x)}
          y={Math.min(mouseCoords.y, mouseDownCoords.y)}
          width={Math.abs(mouseCoords.x - mouseDownCoords.x)}
          height={Math.abs(mouseCoords.y - mouseDownCoords.y)}
          fill="#ffaaaa"
        />
      )) || null;
    } else {
      return null;
    }
  };

  const getTooltipText = () => {
    if ((state.type === 'rect') && (state.mouseDownCoords)) {
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
    getTooltipText
  });
};// end makeRectangleDispatcher

const Canvas = (props: CanvasProps) => {
  const { width, height, currentTool } = props;
  const stageRef = useRef<any>(null);
  // for generating unique ids
  const [shapes, setShapes] = useState<ShapeModel[]>([]);
  const [state, setState] = useState<ShapeState>(({ type: 'nil' }));

  const addShapes = (newShapes: ShapeModel[]) => {
    setShapes((currShapes) => [
      ...currShapes,
      ...newShapes
    ]);
  };

  const dispatcher = (() => {
    switch (currentTool) {
      case 'hand':
        return makeMockDispatcher({ state, setState, addShapes });
      case 'rect':
        return makeRectangleDispatcher({ state, setState, addShapes });
      case 'ellipse':
        return makeMockDispatcher({ state, setState, addShapes });
      case 'vector':
        return makeMockDispatcher({ state, setState, addShapes });
      default:
        return makeMockDispatcher({ state, setState, addShapes });
    }
  })();

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
          shapes.map((shape: ShapeModel, idx: number) => {
            switch (shape.type) {
              case 'rect':
                {
                  const { x, y, width, height } = shape;
                  
                  return (
                    <Rect
                      key={idx}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill="red"
                      shadowBlur={10}
                    />
                  );
                }
              default:
                // TODO: make sure there is an implementation for each shape
                // type
                return null;
            }
          })
        }
      </Layer>
    </Stage>
  );
};

export default Canvas;
