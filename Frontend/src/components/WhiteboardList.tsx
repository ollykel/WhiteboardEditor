// === WhiteboardList.tsx ======================================================
//
// Displays a list of whiteboards in whiteboard cards.
//
// Assumes the calling function is fetching the whiteboards using react-query or
// a similar service. For this reason, the component assumes a status of
// 'loading', 'ready', or 'error', which indicates whether the component should
// render the passed-in whiteboards, a loading message, or an error message.
//
// NOTE: Error messages will be displayed to user; ensure error messages don't
// contain any sensitive server-side information. The API call from which the
// messages are derived should not expose any such information to the client.
//
// =============================================================================

// -- local imports
import type {
  Whiteboard
} from '@/types/APIProtocol';

import WhiteboardCard from '@/components/WhiteboardCard';

export type WhiteboardListProps = 
  // NOTE: message will be displayed to user; ensure it doesn't contain any
  // sensitive server-side information. The API call from which this message is
  // derived should not expose any such information to the client.
  | { status: 'error';  message: string; }
  | { status: 'loading'; }
  | { status: 'ready'; whiteboardsAttribs: Whiteboard[]; }
;

const WhiteboardList = (props: WhiteboardListProps): React.JSX.Element => {
  switch (props.status) {
    case 'error':
    {
        const {
          message
        } = props;

        console.log('Error fetching whiteboards for WhiteboardList:', message);

        return (
          <div>
            <p className="text-lg font-bold text-red">
              Error: {message}
            </p>
          </div>
        );
    }
    case 'loading':
    {
        return (
          <div>
            <p className="text-lg font-bold">
              Loading...
            </p>
          </div>
        );
    }
    case 'ready':
    {
        const {
          whiteboardsAttribs
        } = props;

        return (
          <ul
            className="flex flex-row flex-wrap"
          >
          {
              whiteboardsAttribs.map(attribs => (
                <li
                  key={attribs._id}
                >
                  <WhiteboardCard
                    {...attribs}
                  />
                </li>
              ))
          }
          </ul>
        );
    }
    default:
    {
        console.error('Received unrecognized props for WhiteboardList:', props);

        return (
          <div>
            <p className="text-lg font-bold text-red">
              Error: invalid WhiteboardList props
            </p>
          </div>
        );
    }
  }
};// end WhiteboardList

export default WhiteboardList;
