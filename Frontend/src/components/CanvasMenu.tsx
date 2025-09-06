import { useState } from "react";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { ChevronsUpDown } from "lucide-react";

interface CanvasMenuProps {
  allowedUsers: string[];
  setAllowedUsers: (users: string[]) => void;
  allUsers: string[];
}

function CanvasMenu({ allowedUsers, setAllowedUsers, allUsers }: CanvasMenuProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleUser = (user: string) => {
    if (allowedUsers.includes(user)) {
      setAllowedUsers(allowedUsers.filter(u => u !== user));
    }
    else {
      setAllowedUsers([...allowedUsers, user])
    }
  };

  const handleDelete = () => {
    console.log("delete clicked");
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

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="justify-between"
              >
                {allowedUsers.length > 0
                  ? `${allowedUsers.length} user(s) selected`
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
                  {allUsers.map((user) => (
                    <CommandItem
                      key={user}
                      onSelect={() => toggleUser(user)}
                      className='flex items-center gap-2'
                    >
                      <Checkbox checked={allowedUsers.includes(user)} />
                      <span>{user}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

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