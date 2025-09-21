import { Link } from 'react-router-dom';

// -- local imports
import type {
  Whiteboard,
  UserPermissionEnum,
} from '@/types/APIProtocol';

import {
  useUser,
} from '@/hooks/useUser';

import {
  UserTagBrief,
  UserTagEmail,
} from '@/components/UserTag';

export type WhiteboardProps = Whiteboard;

function WhiteboardCard({
  _id,
  name,
  owner,
  shared_users: sharedUsers
}: WhiteboardProps) {
  const { user } = useUser();

  // -- rephrase permissions as the user's role
  const permissionTypeToUserRole = (perm: UserPermissionEnum): string => {
    switch (perm) {
      case 'view':
        return 'viewer';
      case 'edit':
        return 'editor';
      case 'own':
        return 'owner';
      default:
        // permission unaccounted for; should never happen
        throw new Error(`Permission unaccounted for: ${perm}`);
    }
  };

  return (
    <Link 
      key={_id}
      to={`/whiteboard/${_id}`}
      className="flex flex-col justify-center m-10 w-120 rounded-xl shadow bg-stone-50 hover:bg-gray-200"
    >
      {/** TODO: replace with actual preview image, with a standard fallback image in /static **/}
      <img src="/images/Screenshot 2025-08-17 at 1.16.54 PM.png" alt="Whiteboard Thumbnail" />
      <div className="p-5">
        <h1 className=" text-lg font-bold">{name}</h1>
        <h2 className="">
          Owner: {user?._id === owner._id ?
            (<strong>You</strong>)
            :
            (<>{owner.username} ({owner.email})</>)
          }
        </h2>

        {/** List shared users **/}
        <h3 className="">Collaborators: </h3>
        <ul
          className="flex flex-row flex-wrap"
        >
          {sharedUsers?.map(perm => {
            if (perm.type === 'user') {
              if ((typeof perm.user) !== 'object') {
                throw new Error(`User must be object; received ${perm.user}`);
              }

              return (
                <li key={`user:${perm.user._id}`}>
                  <UserTagBrief
                    size="small"
                    user={perm.user}
                    note={
                      <span> ({permissionTypeToUserRole(perm.permission)})</span>
                    }
                  />
                </li>
              );
            } else {
              return (
                <li key={`email:${perm.email}`}>
                  <UserTagEmail
                    size="small"
                    user={{ email: perm.email }}
                    note={
                      <span> ({permissionTypeToUserRole(perm.permission)})</span>
                    }
                  />
                </li>
              );
            }
          })}
        </ul>
      </div>
    </Link>
  );
}

export default WhiteboardCard;
