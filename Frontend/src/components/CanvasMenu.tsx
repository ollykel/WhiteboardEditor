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
  store,
  type RootState,
} from "@/store";
import WhiteboardContext from "@/context/WhiteboardContext";
import { deleteCanvas } from "@/controllers";
import AllowedUsersPopover from "@/components/AllowedUsersPopover";

import type { 
  ClientMessageDeleteCanvases, 
  CanvasIdType, 
  WhiteboardIdType ,
  CanvasKeyType,
  UserSummary,
} from "@/types/WebSocketProtocol";
import { useSelector } from "react-redux";
import { selectAllowedUsersByCanvas, setAllowedUsersByCanvas } from "@/store/allowedUsers/allowedUsersByCanvasSlice";
import type { User } from "@/types/APIProtocol";

interface CanvasMenuProps {
  canvasId: CanvasIdType;
  whiteboardId: WhiteboardIdType;
}

function CanvasMenu({ canvasId, whiteboardId }: CanvasMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = store.dispatch;
  const allowedUsers = useSelector((state: RootState) =>
    selectAllowedUsersByCanvas(state, [whiteboardId, canvasId]) ?? []
  );

  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("CanvasMenu must be used inside a WhiteboardProvider");
  }
  const { 
    socketRef, 
  } = context;

  const handleUpdateAllowedUsers = (newUsers: User[]) => {
    // Map to proper type
    const usersToSend: UserSummary[] = newUsers.map(u => ({
      userId: u._id,
      username: u.username,
    }));

    // Update Redux
    const canvasKey: CanvasKeyType = [whiteboardId, canvasId];
    const canvasKeyString = canvasKey.join(", ");
    dispatch(
      setAllowedUsersByCanvas({ 
        [canvasKeyString]: usersToSend
      })
    );

    // Send WS message
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify({
        type: 'update_canvas_allowed_users',
        canvasId,
        allowedUsers: usersToSend,
      }));
    }
  };

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
  };

  const handleDownload = () => {
    console.log("download clicked");
  };

  const handleViewMain = () => {
    console.log("view main screen clicked")
  };

  const handleRequestAccess = () => {
    console.log("request access clicked");
  };

  const handleMerge = () => {
    console.log("merge clicked");
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
            selected={allowedUsers.map(u => ({
              _id: u.userId,
              username: u.username,
              email: "",
            }))}
            onChange={handleUpdateAllowedUsers}
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