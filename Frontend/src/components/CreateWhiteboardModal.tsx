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

interface CreateWhiteboardFormAttribs {
  name: string;
}

const FORM_ATTRIBS_DEFAULT = {
  name: ''
};

export interface CreateWhiteboardFormData extends CreateWhiteboardFormAttribs {
  collaboratorEmails: string[];
}

export interface CreateWhiteboardModalProps {
  onSubmit: (data: CreateWhiteboardFormData) => void;
}

const CreateWhiteboardModal = ({
  onSubmit
}: CreateWhiteboardModalProps): React.JSX.Element => {
  // -- managed state
  const [isOpen, setIsOpen] = useState<boolean>();
  const [emailSet, setEmailSet] = useState<Record<string, boolean>>({});
  const [newEmail, setNewEmail] = useState<string>("");
  const [formInputs, setFormInputs] = useState<CreateWhiteboardFormAttribs>({
    ...FORM_ATTRIBS_DEFAULT
  });

  const handleChangeNewEmail = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setNewEmail(ev.target.value);
  };

  const handleAddNewEmail = (ev: React.MouseEvent<HTMLButtonElement>) => {
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
        className="mr-2 mb-2 px-2 py-1 inline-block align-middle rounded-2xl bg-gray-200 border-gray-600"
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

  const handleChangeInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();

    const name = ev.target.name
    const value = ev.target.value;

    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const collaboratorEmails = Object.keys(emailSet);
    const data = {
      ...formInputs,
      collaboratorEmails
    };

    if (!data.name) {
      alert('Name required');
      return;
    }

    onSubmit(data);
    setIsOpen(false);
    setFormInputs({ ...FORM_ATTRIBS_DEFAULT });
    setEmailSet({});
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
        <form onSubmit={handleSubmit}>
          <h2 className="text-center text-2xl font-bold m-2">Create a new whiteboard</h2>

          <Command className="flex flex-col flex-shrink p-4">
            <div className="flex flex-col">
              <label htmlFor="whiteboard-name">Whiteboard Name:</label>
              <Input
                name="name"
                type="text"
                onChange={handleChangeInput}
                value={formInputs.name}
                required
                placeholder="Whiteboard Name"
              />
            </div>
          </Command>

          <Command className="flex flex-col flex-shrink p-4">
            <h3 className="text-lg font-semibold">
              Invite collaborators by email
            </h3>

            <div
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
                variant="secondary"
                onClick={handleAddNewEmail}
              >
                + Add Email
              </Button>
            </div>

            <CommandGroup>
              {/** Display user emails to add, with option to remove **/}
              <h3>Collaborators to invite:</h3>
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

          <div className="flex flex-row justify-center">
            <Button
              type="submit"
              className="w-1/2"
            >
              + Create Whiteboard
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default CreateWhiteboardModal;
