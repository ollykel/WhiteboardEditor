import { 
  useState,
  useContext,
} from "react";

import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

import { 
  type RootState,
} from "@/store";
import WhiteboardContext from "@/context/WhiteboardContext";
import AllowedUsersPopover from "@/components/AllowedUsersPopover";

import type { 
  ClientMessageDeleteCanvases, 
  CanvasIdType, 
  WhiteboardIdType,
} from "@/types/WebSocketProtocol";
import { useSelector } from "react-redux";
import { selectAllowedUsersByCanvas } from "@/store/allowedUsers/allowedUsersByCanvasSlice";

interface CanvasMenuProps {
  canvasId: CanvasIdType;
  whiteboardId: WhiteboardIdType;
}

function CanvasMenu({ canvasId, whiteboardId }: CanvasMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const allowedUsers = useSelector((state: RootState) =>
    selectAllowedUsersByCanvas(state, [whiteboardId, canvasId])
  ) ?? [];
  const [selectedUsers, setSelectedUsers] = useState<string[]>(allowedUsers);

  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("CanvasMenu must be used inside a WhiteboardProvider");
  }
  const { 
    socketRef, 
  } = context;

  const handleUpdateAllowedUsers = (allowedUsers: string[]) => {
    // Send WS message
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'update_canvas_allowed_users',
        canvasId,
        allowedUsers,
      }));
    }
  };

  const handleDelete = () => {
    // broadcast to server
    if (socketRef.current) {
      const msg: ClientMessageDeleteCanvases = {
        type: "delete_canvases",
        canvasIds: [canvasId],
      };

      socketRef.current.send(JSON.stringify(msg));
    }
  };

  const handleDownload = () => {
    console.log("download clicked");
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Canvas Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
            Edit Allowed Users
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleDownload}>
            Download
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleDelete}>
            Delete Canvas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Users Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Allowed Users</DialogTitle>
          </DialogHeader>

          <AllowedUsersPopover 
            selected={selectedUsers}
            onChange={setSelectedUsers}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => {
              setSelectedUsers(allowedUsers); // Reset to original selection
              setDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleUpdateAllowedUsers(selectedUsers);
              setDialogOpen(false);
            }}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CanvasMenu;
