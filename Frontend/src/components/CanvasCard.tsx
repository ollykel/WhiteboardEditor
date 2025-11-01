import {
  useState,
  useContext,
  useEffect,
} from 'react';

import {
  useSelector,
} from 'react-redux';

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
  type User,
} from '@/types/APIProtocol';

import UserCacheContext from '@/context/UserCacheContext';

import {
  type ShapeAttributesState,
} from '@/reducers/shapeAttributesReducer';

import {
  type RootState,
} from '@/store';

import {
  selectAllowedUsersByCanvas,
} from '@/store/allowedUsers/allowedUsersByCanvasSlice';

import {
  type NewCanvasDimensions,
} from '@/types/CreateCanvas';
import WhiteboardContext from '@/context/WhiteboardContext';

export interface CanvasCardProps {
  whiteboardId: WhiteboardIdType;
  rootCanvasId: CanvasIdType,
  shapeAttributes: ShapeAttributesState;
  childCanvasesByCanvas: Record<string, CanvasKeyType[]>;
  canvasesByKey: Record<string, CanvasData>;
  currentTool: ToolChoice;
  onSelectCanvasDimensions: (canvasId: CanvasIdType, dimensions: NewCanvasDimensions) => void;
}

function CanvasCard(props: CanvasCardProps) {
  const {
    whiteboardId,
    rootCanvasId,
    shapeAttributes,
    childCanvasesByCanvas,
    canvasesByKey,
    currentTool,
    onSelectCanvasDimensions,
  } = props;

  const userCacheContext = useContext(UserCacheContext);

  if (! userCacheContext) {
    throw new Error('No UserCacheContext provided to CanvasCard');
  }

  const {
    getUserById,
  } = userCacheContext;

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error('No WhiteboardContext provided to CanvasCard');
  }

  const {
    selectedCanvasId
  } = whiteboardContext;

  const [selectedCanvasAllowedUsers, setSelectedCanvasAllowedUsers] = useState<User[] | null>(null);

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

  const allowedUserIds = useSelector(
    // ['', ''] is effectively a null canvas key
    (state: RootState) => selectAllowedUsersByCanvas(state, selectedCanvasKey || ['', ''])
  );

  useEffect(
    () => {
      if (! selectedCanvas) {
        setSelectedCanvasAllowedUsers(null);
      } else {
        const mapUsers = async () => {
          const newAllowedUsers = (await Promise.all(allowedUserIds
            .map(uid => getUserById(uid))))
            .filter(user => !!user);

          setSelectedCanvasAllowedUsers(newAllowedUsers);
        };// -- end mapUsers

        mapUsers();
      }
    },
    [selectedCanvas, allowedUserIds, getUserById]
  );

  return (
    <div className="flex flex-col">
      {/* Name selected canvas, if a canvas is selected */}
      <div
        className="fixed top-40 left-2 right-0 z-50 min-h-16"
      >
        {selectedCanvas && (
          <>
            <h2>
              <strong>Selected Canvas:</strong> {selectedCanvas.name}
            </h2>
            <h3>
              <strong>Allowed Users:</strong> {selectedCanvasAllowedUsers
                ?.map(user => user.username)
                .join(', ')
                ?? 'all'
              }
            </h3>
          </>
        )}
      </div>

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
                onSelectCanvasDimensions,
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
