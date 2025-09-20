import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { 
  Check,
  ChevronsUpDown,  
} from "lucide-react";

import { 
  Popover, 
  PopoverContent,
  PopoverTrigger, 
} from "@/components/ui/popover";
import { 
  Command,
  CommandInput, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";

import api from "@/api/axios";

import type { 
  UserPermission,
} from "@/types/APIProtocol";
import type { UserSummary } from "@/types/WebSocketProtocol";

interface AllowedUsersPopoverProps {
  selected: UserSummary[]; // current allowed users
  onChange: (next: UserSummary[]) => void; // notify parent of changes
};

const AllowedUsersPopover = ({  }: AllowedUsersPopoverProps) => {
  const [open, setOpen] = useState(false);
  

  const canvas = whiteboard?.canvases?.find(c => c.id === canvasId);
  const allowedUsers = canvas?.allowed_users ?? [];
  const sharedUsers = whiteboard?.shared_users ?? [];

  

  const allowedUserIds = allowedUsers.map(u => u._id);

  const toggleUser = (userId: string) => {
    const next = allowedUserIds.includes(userId)
      ? allowedUserIds.filter(id => id !== userId)
      : [...allowedUserIds, userId];

    updateAllowedUsers.mutate(next);
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
                  value={userPerm.user._id}
                  onSelect={() => toggleUser(userPerm.user._id)}
                  className='flex items-center gap-2'
                >
                  {userPerm.user.username}
                  <Check 
                    className={`ml-auto h-4 w-4 ${
                      allowedUsers.includes(userPerm.user) ? "opacity-100" : "opacity-0"
                    }`}             
                  />
                </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  ) ; 
}

export default AllowedUsersPopover;