import { useSelector } from "react-redux";

import { type RootState } from "@/store";
import { selectAllowedUsersByCanvas } from "@/store/allowedUsers/allowedUsersByCanvasSlice";

import Canvas from "./Canvas";
import CanvasMenu from "./CanvasMenu";

import type { CanvasProps } from '@/components/Canvas';
import type { WhiteboardIdType } from "@/types/WebSocketProtocol";

interface CanvasCardProps extends CanvasProps {
  title: string;
  whiteboardId: WhiteboardIdType;
}

function CanvasCard(props: CanvasCardProps) {
  const { id, title, whiteboardId } = props;
  const allowedUsers = useSelector((state: RootState) =>
    selectAllowedUsersByCanvas(state, [whiteboardId, id]) ?? []
  );

  return (
    <div className="flex flex-col p-6">
      {/* Active Users */}
      <div className="text-center">
        Allowed Users: {allowedUsers.join(', ')} {/* TODO: Map to usernames */}
      </div>
      {/* Title */}
      <div className="text-center p-4">{title}</div>
      {/* Konva Canvas */}
      <div className="border border-black">
        <Canvas {...props} />
      </div>
      {/* Currently Drawing */}
      <div className="currently-drawing">Joe is drawing...</div>
      {/* Canvas Menu */}
      <CanvasMenu 
        canvasId={id}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}

export default CanvasCard;
