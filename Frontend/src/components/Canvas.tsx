// === Canvas ==================================================================
//
// Component which allows users to draw within the browser.
//
// Makes use of react-konva. For documentation, see
// https://konvajs.org/docs/react/index.html.
//
// =============================================================================

import {
  useRef,
} from 'react';
import { Stage, Layer, Text } from 'react-konva';
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
} from '@/types/OperationDispatcher';

// -- dispatchers
import useMockDispatcher from '@/dispatchers/useMockDispatcher';
import useInaccessibleDispatcher from '@/dispatchers/useInaccessibleDispatcher';
import useRectangleDispatcher from '@/dispatchers/useRectangleDispatcher';
import useEllipseDispatcher from '@/dispatchers/useEllipseDispatcher';
import useVectorDispatcher from '@/dispatchers/useVectorDispatcher';

export interface CanvasProps {
  width: number;
  height: number;
  shapes: CanvasObjectModel[];
  onAddShapes: (shapes: CanvasObjectModel[]) => void;
  shapeAttributes: ShapeAttributesState;
  currentTool: ToolChoice;
  disabled: boolean;
}

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

  // TODO: delegate draggability to tool definitions
  const areShapesDraggable = (currentTool === 'hand');

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

              return renderShape(idx, shape, areShapesDraggable);
            })
          }
        </Layer>
      </Stage>
    </>
  );
};

export default Canvas;
