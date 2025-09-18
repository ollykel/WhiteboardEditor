import { useState } from "react";

import { 
  ChevronsUpDown,  
} from "lucide-react";

import { 
  Popover, 
  PopoverContent,
  PopoverTrigger, 
} from "@/components/ui/popover";
import { 
  Checkbox, 
} from "@/components/ui/checkbox";
import { 
  Command,
  CommandInput, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

import type { UserPermission } from "@/types/APIProtocol";

interface AllowedUsersPopoverProps {
  sharedUsers: UserPermission[];
  allowedUsers: string[];
  setAllowedUsers: (users: string[]) => void;
}

const AllowedUsersPopover = ({ sharedUsers, allowedUsers, setAllowedUsers }: AllowedUsersPopoverProps) => {
  const [open, setOpen] = useState(false);

  const toggleUser = (user: string) => {
    if (allowedUsers.includes(user)) {
      setAllowedUsers(allowedUsers.filter(u => u !== user));
    }
    else {
      setAllowedUsers([...allowedUsers, user])
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between"
        >
          {allowedUsers.length > 0
            ? `${allowedUsers.length}${allowedUsers.length === 1 ? ' user selected' : ' users selected'}`
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
            {sharedUsers
              .filter((u): u is Extract<UserPermission, { type: "id" }> => u.type === "id")
              .map((userPerm) => (
                <CommandItem
                  key={userPerm.user._id}
                  onSelect={() => toggleUser(userPerm.user._id)}
                  className='flex items-center gap-2'
                >
                  <Checkbox checked={allowedUsers.includes(userPerm.user._id)} />
                  <span>{userPerm.user.username}</span>
                </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  ) ; 
}

export default AllowedUsersPopover;