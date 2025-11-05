// -- std imports
import { 
  useState,
  useContext,
  type RefObject,
} from "react";

// -- third-party imports
import Konva from 'konva';

// -- local imports
import {
  KONVA_NODE_UI_ONLY_KEY,
} from '@/app.config';

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

const CanvasMenu = ({
  canvasId,
  whiteboardId,
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

    const canvasGroupRef : RefObject<Konva.Group | null> | undefined = canvasGroupRefsByIdRef.current[canvasId];

    if (! canvasGroupRef?.current) {
      console.error('Could not find ref to Canvas with id', canvasId);
      alert('Error exporting Canvas');
    } else {
      // -- create a clone of the Canvas group that excludes UI-only elements
      //    such as borders and tooltips.
      const exportableCanvas : Konva.Node = canvasGroupRef.current.clone();

      const isNodeContainer = (node: Konva.Node): node is Konva.Container => node.hasChildren();

      const destroyUIOnlyDescendants = (node: Konva.Node) => {
        if (isNodeContainer(node)) {
          for (const child of node.getChildren()) {
            if (child.hasName(KONVA_NODE_UI_ONLY_KEY)) {
              child.destroy();
            } else {
              destroyUIOnlyDescendants(child);
            }
          }// -- end for child
        }
      };// -- end destroyUIOnlyDescendants

      // -- filter out UI-only nodes
      destroyUIOnlyDescendants(exportableCanvas);

      const exportUrl : string = exportableCanvas.toDataURL({
        mimeType: 'image/png',
      });

      // -- create a dummy link that the function can "click"
      const downloadLink : HTMLAnchorElement = document.createElement('a');

      // TODO: replace with canvas or whiteboard name
      downloadLink.download = 'canvas_export.png';
      downloadLink.href = exportUrl;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // -- destroy temporary exportable canvas node
      exportableCanvas.destroy();
    }
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
