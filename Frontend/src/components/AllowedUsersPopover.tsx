// -- std imports
import { 
  useState,
  useContext,
 } from "react";

// -- third-party imports
import { 
  useQuery 
} from "@tanstack/react-query";

import { 
  Check,
  ChevronsUpDown,  
} from "lucide-react";

// -- local imports

import {
  match,
} from '@/utils';

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

import api from '@/api/axios';

interface AllowedUsersPopoverProps {
  selected: string[]; // current allowed users
  onChange: (next: string[]) => void; // notify parent of changes
};

type EnumComponentStatus =
  | 'error'
  | 'loading'
  | 'ready'
;

const AllowedUsersPopover = ({ selected, onChange }: AllowedUsersPopoverProps) => {
  const [open, setOpen] = useState(false);

  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("throw new Error('No WhiteboardContext provided');");
  }
  const whiteboardId = context.whiteboardId;
  
  const {
    data: whiteboard,
    error: whiteboardError,
    isLoading: isWhiteboardLoading,
    isFetching: isWhiteboardFetching,
  } = useQuery<APIWhiteboard>({
    queryKey: ["whiteboard", whiteboardId],
    queryFn: async () => {
      const res = await api.get(`/whiteboards/${whiteboardId}`);

      if (res.status >= 400) {
        throw new Error(
          `GET /whiteboards/${whiteboardId} failed with status ${res.status} (${res.statusText}): ${res.data}`
        );
      } else {
        return res.data;
      }
    }
  });

  // -- derived state
  const status : EnumComponentStatus = (() => {
    if (whiteboardError) {
      return 'error';
    } else if (isWhiteboardLoading || isWhiteboardFetching) {
      return 'loading';
    } else {
      return 'ready';
    }
  })();
  
  const sharedUsers = whiteboard?.shared_users ?? [];

  const toggleUser = (user: string) => {
    const next = selected.includes(user)
      ? selected.filter((u: string) => u !== user)
      : [...selected, user];
    onChange(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={status !== 'ready'}
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
          <CommandInput
            disabled={status !== 'ready'}
            placeholder='Search users...'
          />
          <CommandEmpty>No users found</CommandEmpty>
          <CommandGroup>
            {match<EnumComponentStatus, React.ReactNode>({
              'error': () => (
                  <>
                    <span
                      className="text-lg text-red font-bold fond-mono"
                    >
                      Error: {`${whiteboardError}`}
                    </span>
                  </>
              ),
              'loading': () => (
                  <>
                    <span
                      className="text-lg font-bold fond-mono"
                    >
                      Loading ...
                    </span>
                  </>
              ),
              'ready': () => (
                sharedUsers
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
                          selected.includes(userPerm.user._id) ? "opacity-100" : "opacity-0"
                        }`}             
                      />
                    </CommandItem>
              )))
            }, status)}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  ) ; 
}

export default AllowedUsersPopover;
