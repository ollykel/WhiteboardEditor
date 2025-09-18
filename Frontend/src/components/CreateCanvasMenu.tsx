import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AllowedUsersPopover from '@/components/AllowedUsersPopover';

import type { UserPermission } from '@/types/APIProtocol';

interface CreateCanvasMenuProps {
  onCreate: (name: string, allowedUsers: string[]) => void
  sharedUsers: UserPermission[];
}

function CreateCanvasMenu({ onCreate, sharedUsers }: CreateCanvasMenuProps) {
  console.log("Shared users: ", sharedUsers); // Debugging
  const [canvasName, setCanvasName] = useState("");
  const [allowedUsers, setAllowedUsers] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!canvasName.trim()) {
      alert("Canvas name cannot be empty");
      return;
    }

    onCreate(canvasName, allowedUsers);
    setCanvasName("");
    setAllowedUsers([]);
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
        sharedUsers={sharedUsers}
        allowedUsers={allowedUsers}
        setAllowedUsers={setAllowedUsers}
      />

      <Button className="mt-2" onClick={handleSubmit}>
        Create
      </Button>
    </div>
  );
}

export default CreateCanvasMenu;