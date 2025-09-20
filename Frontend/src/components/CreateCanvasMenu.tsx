import { useContext, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AllowedUsersPopover from '@/components/AllowedUsersPopover';

import WhiteboardContext from '@/context/WhiteboardContext';

interface CreateCanvasMenuProps {
  onCreate: (name: string) => void
}

function CreateCanvasMenu({ onCreate }: CreateCanvasMenuProps) {
  const [canvasName, setCanvasName] = useState("");
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("throw new Error('No WhiteboardContext provided');")
  }

  const handleSubmit = () => {
    if (!canvasName.trim()) {
      alert("Canvas name cannot be empty");
      return;
    }

    onCreate(canvasName);
    setCanvasName("");
  }

  return (
    <div className="grid gap-2">
      <h1 className='text-center font-bold'>Create New Canvas</h1>

      <Label htmlFor="name">Canvas Name</Label>
      <Input
        id="name"
        value={canvasName}
        onChange={(e) => setCanvasName(e.target.value)}
        placeholder="Enter name"
      />

      <Label htmlFor="users">Allowed Users</Label>
      
      <AllowedUsersPopover 
        whiteboardId={whiteboardId}
        canvasId={canvasId}
      />

      <Button className="mt-2" onClick={handleSubmit}>
        Create
      </Button>
    </div>
  );
}

export default CreateCanvasMenu;