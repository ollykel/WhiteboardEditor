import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AllowedUsersPopover from '@/components/AllowedUsersPopover';

interface CreateCanvasMenuProps {
  onCreate: (canvas: NewCanvas) => void
}

// Add more fields later (height, width, etc.)
export interface  NewCanvas {
  canvasName: string;
  allowedUsers: string[];
}

function CreateCanvasMenu({ onCreate }: CreateCanvasMenuProps) {
  const [canvasName, setCanvasName] = useState("");
  const [newCanvasAllowedUsers, setNewCanvasAllowedUsers] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!canvasName.trim()) {
      alert("Canvas name cannot be empty");
      return;
    }

    onCreate({
      canvasName,
      allowedUsers: newCanvasAllowedUsers,
    });
    
    setCanvasName("");
    setNewCanvasAllowedUsers([]);
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
        selected={newCanvasAllowedUsers}
        onChange={setNewCanvasAllowedUsers}
      />

      <Button className="mt-2" onClick={handleSubmit}>
        Create
      </Button>
    </div>
  );
}

export default CreateCanvasMenu;