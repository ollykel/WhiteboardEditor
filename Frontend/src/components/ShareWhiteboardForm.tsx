// -- std imports
import {
  useState
} from 'react';

// -- third-party imports
import {
  X
} from 'lucide-react';

// -- local imports

import {
  Button
} from '@/components/ui/button';

import {
  Input
} from '@/components/ui/input';

export interface ShareWhiteboardFormData {
  collaboratorEmails: string[];
}

export interface ShareWhiteboardFormProps {
  initCollaboratorEmails: string[];
  onSubmit: (data: ShareWhiteboardFormData) => void;
}

const ShareWhiteboardForm = ({
  initCollaboratorEmails,
  onSubmit
}: ShareWhiteboardFormProps): React.JSX.Element => {
  // -- prop-derived state
  const initEmailSet: Record<string, boolean> = Object.fromEntries(initCollaboratorEmails.map(email => [
    email, true
  ]));

  // -- managed state
  const [emailSet, setEmailSet] = useState<Record<string, boolean>>(initEmailSet);
  const [newEmail, setNewEmail] = useState<string>("");

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

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const data = ({
      collaboratorEmails: Object.keys(emailSet)
    });

    setEmailSet({});
    onSubmit(data);
  };

  return (
    <div className="w-200 p-0 m-4 flex flex-col flex-shrink">
      <form onSubmit={handleSubmit}>
        <h2 className="text-center text-2xl font-bold m-2">Control access to this whiteboard</h2>

        <div className="flex flex-col flex-shrink p-4">
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

          <div>
            {/** Display user emails to add, with option to remove **/}
            <h3>Collaborators to invite:</h3>
            <ul className="flex flex-row flex-wrap">
            {
                Object.keys(emailSet).length ?
                  Object.keys(emailSet).map(email => (
                      <li key={email}>
                        {RemovableEmail(email)}
                      </li>
                    ))
                  :
                  "No emails selected"
            }
            </ul>
          </div>
        </div>

        <div className="flex flex-row justify-center">
          <Button
            type="submit"
            className="w-1/2"
          >
            Update Shared Users
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShareWhiteboardForm;
