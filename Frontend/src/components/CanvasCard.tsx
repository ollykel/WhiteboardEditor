import { useState } from "react";

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

  // TODO: Use context to get dynamic state from database(?) outside card
  const [allowedUsers, setAllowedUsers] = useState<string[]>(["joe"]);

  return (
    <div className="flex flex-col p-6">
      {/* Active Users */}
      <div className="text-center">Active Users: </div>
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
        allowedUsers={allowedUsers}
        setAllowedUsers={setAllowedUsers}
        canvasId={id}
        whiteboardId={whiteboardId}
      />
    </div>
  );
}

export default CanvasCard;
