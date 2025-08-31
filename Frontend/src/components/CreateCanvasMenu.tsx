import { useState } from 'react';

// import CreateCanvasInput from "./CreateCanvasInput";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PopoverMenu from "./PopoverMenu";

interface CreateCanvasMenuProps {
  onCreate: (name: string, allowedUsers: string[]) => void
}

function CreateCanvasMenu({ onCreate }: CreateCanvasMenuProps) {
  const [canvasName, setCanvasName] = useState("");
  const [allowedUsers, setAllowedUsers] = useState("");

  const handleSubmit = () => {
    const users = allowedUsers
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)

    onCreate(canvasName, users)
    setCanvasName("")
    setAllowedUsers("")
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Canvas Name</Label>
      <Input
        id="name"
        value={canvasName}
        onChange={(e) => setCanvasName(e.target.value)}
        placeholder="Enter name"
      />
      <Label htmlFor="users">Allowed Users</Label>
      <Input
        id="users"
        value={allowedUsers}
        onChange={(e) => setAllowedUsers(e.target.value)}
        placeholder="Comma-separated usernames"
      />
      <Button className="mt-2" onClick={handleSubmit}>
        Create
      </Button>
    </div>
  );
}

export default CreateCanvasMenu;