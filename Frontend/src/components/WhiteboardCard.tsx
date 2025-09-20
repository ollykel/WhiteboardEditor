import { Link } from 'react-router-dom';

// -- local imports
import type {
  Whiteboard
} from '@/types/APIProtocol';

import {
  useUser
} from '@/hooks/useUser';

export type WhiteboardProps = Whiteboard;

function WhiteboardCard({
  _id,
  name,
  owner,
  shared_users: sharedUsers
}: WhiteboardProps) {
  const { user } = useUser();

  return (
    <Link 
      key={_id}
      to={`/whiteboard/${_id}`}
      className="flex flex-col justify-center m-10 w-75 rounded-xl shadow bg-stone-50 hover:bg-gray-200"
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
        <ul>
          {sharedUsers?.map(perm => {
            if (perm.type === 'user') {
              return (
                <li key={`user:${perm.user._id}`}>
                  {perm.user.username} {`<${perm.user.email}>`} ({perm.permission})
                </li>
              );
            } else {
                <li key={`email:${perm.email}`}>
                  {perm.email} ({perm.permission})
                </li>
            }
          })}
        </ul>
      </div>
    </Link>
  );
}

export default WhiteboardCard;
