// -- std imports
import {
  useState
} from 'react';

// -- third-party imports
import {
  X
} from 'lucide-react';

// -- local imports

// -- ui
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import {
  Command,
  CommandGroup
} from '@/components/ui/command';

import {
  Button
} from '@/components/ui/button';

import {
  Input
} from '@/components/ui/input';

const CreateWhiteboardModal = (): React.JSX.Element => {
  // -- managed state
  const [isOpen, setIsOpen] = useState<boolean>();
  const [emailSet, setEmailSet] = useState<Record<string, boolean>>({});
  const [newEmail, setNewEmail] = useState<string>("");

  const handleChangeNewEmail = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setNewEmail(ev.target.value);
  };

  const handleAddNewEmail = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setNewEmail(newEmail => {
      if (newEmail) {
        setEmailSet(prev => ({ ...prev, [newEmail]: true }));
      }

      return "";
    });
  };

  const makeHandleRemoveEmail = (email: string) => () => {
    setEmailSet(prev => {
      const next = ({ ...prev });

      delete next[email];

      return next;
    });
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const RemovableEmail = (email: string): React.JSX.Element => {
    return (
      <div
        className="m-2 px-2 py-1 inline-block align-middle rounded-md bg-gray-200 border-gray-600"
      >
        <button
          onClick={makeHandleRemoveEmail(email)}
          className="hover:cursor-pointer p-1 inline-block align-middle"
        >
          <X size={18} />
        </button>
        <span>
          {email}
        </span>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          onClick={handleOpenModal}
        >
          + New Whiteboard
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-200 p-0 m-4 flex flex-col flex-shrink">
        <Command className="flex flex-col flex-shrink p-4">
          <h1 className="text-lg font-semibold">
            Invite users by email
          </h1>

          <form
            onSubmit={handleAddNewEmail}
            className="flex flex-row align-top w-160"
          >
            <Input
              name="new-email"
              type="email"
              placeholder="Email"
              onChange={handleChangeNewEmail}
              value={newEmail}
              className="mr-2"
            />

            <Button
              type="submit"
              variant="secondary"
            >
              + Add Email
            </Button>
          </form>

          <CommandGroup>
            {/** Display user emails to add, with option to remove **/}
            <h2>Emails to invite:</h2>
            <ul className="flex flex-row flex-wrap">
            {
                Object.keys(emailSet).length ?
                  Object.keys(emailSet).map(email => (
                      <li>
                        {RemovableEmail(email)}
                      </li>
                    ))
                  :
                  "No emails selected"
            }
            </ul>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CreateWhiteboardModal;
