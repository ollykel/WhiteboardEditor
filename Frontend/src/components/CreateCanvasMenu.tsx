import { useState } from 'react';

import CreateCanvasInput from "./CreateCanvasInput";
import PopoverMenu from "./PopoverMenu";

function CreateCanvasMenu() {
  const [canvasName, setCanvasName] = useState("");
  const [allowedUsers, setAllowedUsers] = useState("");

  const handleCreate = () => {
    console.log("New Canvas Created");
  };


  return (
    <div className="flex ">
      <h2>Create New Canvas</h2>
      <form action="">
        <CreateCanvasInput>

        </CreateCanvasInput>
        USERS
      </form>
      <button onClick={handleCreate}>CREATE</button>
      <PopoverMenu
        trigger={<Button>Create New Canvas</Button>}
      >
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
          <Button className="mt-2" onClick={handleCreate}>
            Create
          </Button>
        </div>
      </PopoverMenu>
    </div>
  );
}

export default CreateCanvasMenu;