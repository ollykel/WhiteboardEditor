import {
  useState,
  useContext,
  useEffect,
} from 'react';

import {
  useSelector,
} from "react-redux";

import {
  Stage,
  Layer,
} from 'react-konva';

import { type RootState } from "@/store";
import { selectAllowedUsersByCanvas } from "@/store/allowedUsers/allowedUsersByCanvasSlice";

import Canvas from "./Canvas";
import CanvasMenu from "./CanvasMenu";

import type { CanvasProps } from '@/components/Canvas';
import type { WhiteboardIdType } from "@/types/WebSocketProtocol";
import type {
  User,
} from "@/types/APIProtocol";

import UserCacheContext from '@/context/UserCacheContext';

interface CanvasCardProps extends CanvasProps {
  title: string;
  whiteboardId: WhiteboardIdType;
}

// Ugly workaround for now
// TODO: rewrite selectAllowedUsersByCanvas selector to use memoization
const EMPTY_ALLOWED_USER_IDS: string[] = [];

function CanvasCard(props: CanvasCardProps) {
  const userCacheContext = useContext(UserCacheContext);

  if (! userCacheContext) {
    throw new Error('User cache context not provided');
  }
  const {
    getUserById,
  } = userCacheContext;

  const {
    id,
    title,
    whiteboardId,
    width,
    height,
  } = props;

  const allowedUserIds = useSelector((state: RootState) =>
    selectAllowedUsersByCanvas(state, [whiteboardId, id])
  ) ?? EMPTY_ALLOWED_USER_IDS;
  const [allowedUsers, setAllowedUsers] = useState<User[]>([]);

  useEffect(
    () => {
      const mapUsers = async () => {
        const newAllowedUsers = (await Promise.all(allowedUserIds.map(uid => getUserById(uid))))
          .filter(user => !!user);

        setAllowedUsers(newAllowedUsers);
      };

      mapUsers();
    },
    [allowedUserIds, getUserById]
  );

  return (
    <div className="flex flex-col p-6">
      {/* Active Users */}
      <div className="text-center">
        Allowed Users: {allowedUsers.map(user => user.username).join(', ')} {/* TODO: Map to usernames */}
      </div>
      {/* Title */}
      <div className="text-center p-4">{title}</div>
      {/* Konva Canvas */}
      <div className="border border-black">
        <Stage
          width={width}
          height={height}
        >
          <Layer>
            {/** Sub-canvases will be rendered recursively by Canvas component **/}
            <Canvas
              {...props}
            />
          </Layer>
        </Stage>
      </div>
      {/* Canvas Menu */}
      <CanvasMenu 
        canvasId={id}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}

export default CanvasCard;
