import {
  type Dispatch,
} from 'react';

import {
  Stage,
  Layer,
} from 'react-konva';

import Canvas from "./Canvas";
import CanvasMenu from "./CanvasMenu";

import type {
  ToolChoice,
} from '@/components/Tool';

import {
  type WhiteboardIdType,
  type CanvasIdType,
  type CanvasKeyType,
  type CanvasData,
} from "@/types/WebSocketProtocol";

import {
  type ShapeAttributesState,
} from '@/reducers/shapeAttributesReducer';

export interface CanvasCardProps {
  whiteboardId: WhiteboardIdType;
  rootCanvasId: CanvasIdType,
  shapeAttributes: ShapeAttributesState;
  childCanvasesByCanvas: Record<string, CanvasKeyType[]>;
  canvasesByKey: Record<string, CanvasData>;
  currentTool: ToolChoice;
  selectedCanvasId: CanvasIdType | null;
  setSelectedCanvasId: Dispatch<CanvasIdType | null>;
}

function CanvasCard(props: CanvasCardProps) {
  const {
    whiteboardId,
    rootCanvasId,
    shapeAttributes,
    childCanvasesByCanvas,
    canvasesByKey,
    currentTool,
    selectedCanvasId,
    setSelectedCanvasId,
  } = props;

  const rootCanvasKey : CanvasKeyType = [whiteboardId, rootCanvasId];
  const rootCanvas : CanvasData | undefined = canvasesByKey[rootCanvasKey.toString()];

  if (! rootCanvas) {
    throw new Error(`Could not find canvas ${rootCanvasId}`);
  }

  const {
    width,
    height,
  } = rootCanvas;

  const selectedCanvasKey : CanvasKeyType | null = selectedCanvasId ? [whiteboardId, selectedCanvasId] : null;
  const selectedCanvasKeyStr : string = selectedCanvasKey?.toString() ?? '';
  const selectedCanvas : CanvasData | null = canvasesByKey[selectedCanvasKeyStr] || null;

  return (
    <div className="flex flex-col p-6">
      {/* Name selected canvas, if a canvas is selected */}
      {selectedCanvas && (
        <h2>
          <strong>Selected Canvas:</strong> {selectedCanvas.name}
        </h2>
      )}
      {/* Konva Canvas */}
      <div className="border border-black">
        <Stage
          width={width}
          height={height}
        >
          <Layer>
            {/** Sub-canvases will be rendered recursively by Canvas component **/}
            <Canvas
              {...{
                ...rootCanvas,
                shapeAttributes,
                currentTool,
                childCanvasesByCanvas,
                canvasesByKey,
                selectedCanvasId,
                setSelectedCanvasId,
                disabled: false
              }}
            />
          </Layer>
        </Stage>
      </div>
      {/* Canvas Menu */}
      {selectedCanvasId && (
        <CanvasMenu 
          canvasId={selectedCanvasId}
          whiteboardId={whiteboardId}
        />
      )}
    </div>
  );
}

export default CanvasCard;
