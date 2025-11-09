// -- std imports
import { 
  useState,
  useContext,
} from "react";

// -- third-party imports
import {
  useSelector,
} from "react-redux";

// -- local imports
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator, 
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

import {
  selectCanvasById,
} from '@/store/canvases/canvasesSelectors';

import WhiteboardContext from "@/context/WhiteboardContext";

import AllowedUsersPopover from "@/components/AllowedUsersPopover";

import type { 
  ClientMessageDeleteCanvases, 
  CanvasIdType, 
  WhiteboardIdType,
  WhiteboardAttribs,
  CanvasKeyType,
  CanvasAttribs,
} from "@/types/WebSocketProtocol";

import {
  selectAllowedUsersByCanvas
} from "@/store/allowedUsers/allowedUsersByCanvasSlice";

import {
  selectWhiteboardById
} from '@/store/whiteboards/whiteboardsSelectors';

import {
  ChevronUp,
  SquarePen,
} from 'lucide-react';
import HeaderButton from "./HeaderButton";
import { captureImage } from "@/lib/captureImage";

interface CanvasMenuProps {
  name: string;
  canvasId: CanvasIdType;
  whiteboardId: WhiteboardIdType;
  allowedUsernames: string[];
}

const CanvasMenu = ({
  name,
  canvasId,
  whiteboardId,
  allowedUsernames,
}: CanvasMenuProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const allowedUsers = useSelector((state: RootState) =>
    selectAllowedUsersByCanvas(state, [whiteboardId, canvasId])
  ) ?? [];
  const [selectedUsers, setSelectedUsers] = useState<string[]>(allowedUsers);

  const whiteboardContext = useContext(WhiteboardContext);

  if (! whiteboardContext) {
    throw new Error("CanvasMenu must be used inside a WhiteboardProvider");
  }

  const { 
    socketRef, 
    canvasGroupRefsByIdRef,
  } = whiteboardContext;

  const whiteboard: WhiteboardAttribs | null = useSelector((state: RootState) => (
    selectWhiteboardById(state, whiteboardId))
  );

  if (! whiteboard) {
    throw new Error(`No whiteboard found with ID whiteboardId`);
  }

  const canvasKey : CanvasKeyType = [whiteboardId, canvasId];

  const canvas : CanvasAttribs | null = useSelector((state: RootState) => (
    selectCanvasById(state, canvasKey)
  ));

  if (! canvas) {
    throw new Error(`Could not find canvas ${canvasId} in application state`);
  }

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
    console.log("!! Download clicked");// TODO: remove debug

    const exportUrl = captureImage(canvasGroupRefsByIdRef, canvasId);

    // -- create a dummy link that the function can "click"
    const downloadLink : HTMLAnchorElement = document.createElement('a');
    const fileName = `${whiteboard.name} - ${canvas.name}.png`;

    downloadLink.download = fileName;
    downloadLink.href = exportUrl;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="shadow-md rounded-lg bg-stone-50">
            <HeaderButton
              title={
                <div className="flex items-center gap-2">
                  <span>
                    Selected Canvas: <strong className="text-lg">{name}</strong>
                  </span>
                  <ChevronUp size={18}/>
                </div>
              }
            />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-48">
        
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Allowed Users
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem 
                className="flex justify-center" 
                onSelect={() => setDialogOpen(true)}
              >
                Edit
                <SquarePen/>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {allowedUsernames.map((u) => (
                <DropdownMenuLabel key={u}>
                  {u}
                </DropdownMenuLabel>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onSelect={handleDownload}>
            Export to PNG
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
};// -- end CanvasMenu

export default CanvasMenu;
