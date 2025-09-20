import { Link } from 'react-router-dom';

// -- local imports
import type {
  WhiteboardAttribs
} from '@/types/WebSocketProtocol';

export type WhiteboardProps = WhiteboardAttribs;

function WhiteboardCard({
  id,
  name
}: WhiteboardProps) {
  return (
    <Link 
      key={id}
      to={`/whiteboard/${id}`}
      className="flex flex-col justify-center m-10 w-75 rounded-xl shadow bg-stone-50 hover:bg-gray-200"
    >
      {/** TODO: replace with actual preview image, with a standard fallback image in /static **/}
      <img src="/images/Screenshot 2025-08-17 at 1.16.54 PM.png" alt="Whiteboard Thumbnail" />
      <div className="p-5">
        <h1 className=" text-lg font-bold">{name}</h1>
        <h2 className="">Owner: </h2>
        <h3 className="">Collaborators: </h3>
      </div>
    </Link>
  );
}

export default WhiteboardCard;
