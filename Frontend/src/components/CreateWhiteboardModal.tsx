// -- std imports
import {
  useState
} from 'react';

// -- third-party imports
import {
  X,
} from 'lucide-react';

// -- local imports

import {
  USER_PERMISSION_TYPES,
  type UserPermission,
  type UserPermissionByEmail,
  type UserPermissionEnum
} from '@/types/APIProtocol';

// -- ui
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import {
  Command,
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
  collaboratorPermissions: UserPermissionByEmail[];
  width: number;
  height: number;
}

export interface CreateWhiteboardModalProps {
  onSubmit: (data: CreateWhiteboardFormData) => void;
}

const CreateWhiteboardModal = ({
  onSubmit
}: CreateWhiteboardModalProps): React.JSX.Element => {
  // -- managed state
  const [isOpen, setIsOpen] = useState<boolean>();
  const [newEmail, setNewEmail] = useState<string>("");
  const [formInputs, setFormInputs] = useState<CreateWhiteboardFormAttribs>({
    ...FORM_ATTRIBS_DEFAULT
  });
  const [newUserPermType, setNewUserPermType] = useState<UserPermissionEnum>(
    USER_PERMISSION_TYPES[0] as UserPermissionEnum
  );
  const [permissionsByEmail, setPermissionsByEmail] = useState<Record<string, UserPermissionByEmail>>({});

  // -- derived state
  const permissions: UserPermissionByEmail[] = Object.values(permissionsByEmail);

  const handleChangeNewEmail = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    setNewEmail(ev.target.value);
  };

  const handleAddNewEmail = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.preventDefault();

    setNewEmail(newEmail => {
      if (newEmail) {
        setPermissionsByEmail(prev => ({
          ...prev,
          [newEmail]: ({
            type: 'email',
            email: newEmail,
            permission: newUserPermType
          })
        }));
      }

      return "";
    });
  };

  const handleOpenModal = () => {
    setIsOpen(true);
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

  const handleChangePermType = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    ev.preventDefault();
    setNewUserPermType(ev.target.value as UserPermissionEnum);
  };

  const handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    // Possibly useful when implementing custom scrolling
    // const windowWidth = window.innerWidth;
    // const windowHeight = window.innerHeight;
    const rootCanvasWidth = 3000;
    const rootCanvasHeight = 3000;

    const data = {
      ...formInputs,
      collaboratorPermissions: permissions,
      width: rootCanvasWidth,
      height: rootCanvasHeight,
    };

    if (! data.name) {
      alert('Name required');
      return;
    }

    onSubmit(data);
    setIsOpen(false);
    setFormInputs({ ...FORM_ATTRIBS_DEFAULT });
  };

  const makeHandleRemoveEmail = (email: string) => () => {
    setPermissionsByEmail(prev => {
      const next = ({ ...prev });

      delete next[email];

      return next;
    });
  };

  const RemovablePermission = (perm: UserPermission): React.JSX.Element => {
    // as an entry in a table
    const email: string = perm.type === 'email' ? perm.email : perm.user.email;
    const username: string = perm.type === 'user' ? perm.user.username : '-';
    const { permission } = perm;

    return (
      <tr key={email}>
        <td className="text-center">{email}</td>
        <td className="text-center">{username}</td>
        <td className="text-center">{permission}</td>
        <td className="text-center">
          <button
            onClick={makeHandleRemoveEmail(email)}
            className="hover:cursor-pointer p-1 inline-block align-middle"
          >
            <X size={18} />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <Popover
      modal
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger asChild>
        <Button
          size="lg"
          onClick={handleOpenModal}
          className="bg-button-large "
        >
          + New Whiteboard
        </Button>
      </PopoverTrigger>

      <PopoverContent className="md:w-160 md:ml-8 flex flex-col flex-shrink">
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
            <h3 className="text-center text-xl font-semibold m-2">
              Collaborators
            </h3>

            <div className="flex flex-col flex-shrink p-4">
              <h4 className="text-md font-semibold my-2">
                Invite collaborators by email
              </h4>

              <div
                className="flex flex-row align-text-bottom w-full"
              >
                <Input
                  name="new-email"
                  type="email"
                  placeholder="Email"
                  onChange={handleChangeNewEmail}
                  value={newEmail}
                  className="mr-2 grow"
                />

                <label
                  htmlFor="permission-type"
                  className="mr-2 grow"
                >
                  Permission:
                </label>
                <select
                  name="permission-type"
                  value={newUserPermType}
                  onChange={handleChangePermType}
                  className="hover:cursor-pointer mr-2"
                >
                  {USER_PERMISSION_TYPES.map(perm => (
                    <option key={perm} value={perm}>{perm}</option>
                  ))}
                </select>

                <Button
                  variant="secondary"
                  onClick={handleAddNewEmail}
                >
                  + Add Collaborator
                </Button>
              </div>

              <div>
                {/** Display user emails to add, with option to remove **/}
                <h4 className="text-md font-semibold my-2">
                  Collaborators to invite:
                </h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>
                        Email
                      </th>
                      <th>
                        Username
                      </th>
                      <th>
                        Permission
                      </th>
                      <th>
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map(perm => RemovablePermission(perm)) }
                  </tbody>
                </table>
                {
                  permissions.length < 1 && <span>No user permissions created</span>
                }
              </div>
            </div>
          </Command>

          <div className="flex flex-row justify-center mb-4">
            <Button
              type="submit"
              className="md:w-1/2"
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
