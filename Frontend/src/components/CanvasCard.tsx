import { useState } from "react";

import Canvas from "./Canvas";
import CanvasMenu from "./CanvasMenu";

import type { CanvasProps } from '@/components/Canvas';

interface CanvasCardProps extends CanvasProps {
  title: string;
  allUsers: string[];
}

function CanvasCard(props: CanvasCardProps) {
  const { title, allUsers } = props;

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
        allUsers={allUsers}
      />
    </div>
  );
}

export default CanvasCard;
