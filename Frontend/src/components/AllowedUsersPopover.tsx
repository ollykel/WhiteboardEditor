import { 
  useState,
  useContext,
 } from "react";
import { 
  useQuery 
} from "@tanstack/react-query";

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

import type { 
  UserPermission,
  Whiteboard as APIWhiteboard,
} from "@/types/APIProtocol";

import WhiteboardContext from "@/context/WhiteboardContext";
import type { ObjectID } from "@/types/CanvasObjectModel";

interface AllowedUsersPopoverProps {
  selected: ObjectID[]; // current allowed users
  onChange: (next: ObjectID[]) => void; // notify parent of changes
};

const AllowedUsersPopover = ({ selected, onChange }: AllowedUsersPopoverProps) => {
  const [open, setOpen] = useState(false);

  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("throw new Error('No WhiteboardContext provided');");
  }
  const whiteboardId = context.whiteboardId;
  
  const { data: whiteboard } = useQuery<APIWhiteboard>({
    queryKey: ["whiteboard", whiteboardId],
  });
  const sharedUsers = whiteboard?.shared_users ?? [];

  const toggleUser = (user: ObjectID) => {
    const next = selected.includes(user)
      ? selected.filter(u => u !== user)
      : [...selected, user];
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="justify-between"
        >
          {selected.length > 0
            ? `${selected.length}${selected.length === 1 ? ' user selected' : ' users selected'}`
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
                  onSelect={() => toggleUser({ id: userPerm.user._id })}
                  className='flex items-center gap-2'
                >
                  {userPerm.user.username}
                  <Check 
                    className={`ml-auto h-4 w-4 ${
                      selected.some(u => u.id === userPerm.user._id) ? "opacity-100" : "opacity-0"
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