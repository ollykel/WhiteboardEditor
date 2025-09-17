import { useState } from 'react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronsUpDown } from "lucide-react";
import type { UserPermission } from '@/types/APIProtocol';

interface CreateCanvasMenuProps {
  onCreate: (name: string, allowedUsers: string[]) => void
  sharedUsers: Extract<UserPermission, { type: 'id' }>[];
}

function CreateCanvasMenu({ onCreate, sharedUsers }: CreateCanvasMenuProps) {
  console.log("Shared users: ", sharedUsers); // Debugging
  const [canvasName, setCanvasName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleUser = (user: string) => {
    setSelectedUsers((prev) =>
      prev.includes(user)
        ? prev.filter((u) => u !== user)
        : [...prev, user]
      );

    setOpen(false);
  };

  const handleSubmit = () => {
    if (!canvasName.trim()) {
      alert("Canvas name cannot be empty");
      return;
    }

    onCreate(canvasName, selectedUsers);
    setCanvasName("");
    setSelectedUsers([]);
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="justify-between"
          >
            {selectedUsers.length > 0
              ? `${selectedUsers.length}${selectedUsers.length === 1 ? ' user selected' : ' users selected'}`
              : "Select users"
            }
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[250px] p-0'>
          <Command>
            <CommandInput placeholder='Search users...' />
            <CommandEmpty>No users found</CommandEmpty>
            <CommandGroup>
              {sharedUsers.map((userPerm) => (
                <CommandItem
                  key={userPerm.user._id}
                  onSelect={() => toggleUser(userPerm.user._id)}
                  className='flex items-center gap-2'
                >
                  <Checkbox checked={selectedUsers.includes(userPerm.user._id)} />
                  <span>{userPerm.user.username}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Button className="mt-2" onClick={handleSubmit}>
        Create
      </Button>
    </div>
  );
}

export default CreateCanvasMenu;