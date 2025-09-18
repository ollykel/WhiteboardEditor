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

import { store } from "@/store";
import WhiteboardContext from "@/context/WhiteboardContext";
import { deleteCanvas } from "@/controllers";
import AllowedUsersPopover from "@/components/AllowedUsersPopover";

import type { 
  ClientMessageDeleteCanvases, 
  CanvasIdType, 
  WhiteboardIdType 
} from "@/types/WebSocketProtocol";

interface CanvasMenuProps {
  allowedUsers: string[];
  setAllowedUsers: (users: string[]) => void;
  canvasId: CanvasIdType;
  whiteboardId: WhiteboardIdType;
}

function CanvasMenu({ allowedUsers, setAllowedUsers, canvasId, whiteboardId }: CanvasMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = store.dispatch;

  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("CanvasMenu must be used inside a WhiteboardProvider");
  }

  const { 
    socketRef, 
    sharedUsers
  } = context;

  const handleDelete = () => {
    // update Redux
    deleteCanvas(dispatch, whiteboardId, canvasId);

    // broadcast to server
    if (socketRef.current) {
      const msg: ClientMessageDeleteCanvases = {
        type: "delete_canvases",
        canvasIds: [canvasId],
      };

      socketRef.current.send(JSON.stringify(msg));
    }
  }

  const handleDownload = () => {
    console.log("download clicked");
  }

  const handleViewMain = () => {
    console.log("view main screen clicked")
  }

  const handleRequestAccess = () => {
    console.log("request access clicked");
  }

  const handleMerge = () => {
    console.log("merge clicked");
  }

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

          <DropdownMenuItem onSelect={handleDelete}>
            Delete Canvas
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleDownload}>
            Download
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleViewMain}>
            View Main Screen
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleRequestAccess}>
            Request Access
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={handleMerge}>
            Merge with Main
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
            sharedUsers={sharedUsers}
            allowedUsers={allowedUsers}
            setAllowedUsers={setAllowedUsers}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {/* TODO: Implement save functionality */}
            <Button onClick={() => setDialogOpen(false)}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CanvasMenu;