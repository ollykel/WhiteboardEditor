// -- std imports
import { useNavigate } from 'react-router-dom';

// -- third-party imports

import {
  useQuery,
  // useQueryClient,
} from '@tanstack/react-query';

// -- local imports

// -- api
import api from '@/api/axios';

import type {
  Whiteboard
} from '@/types/APIProtocol';

// -- components
import HeaderAuthed from "@/components/HeaderAuthed";
import SharedWhiteboards from "@/components/SharedWhiteboards";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/UserAuth";
import CreateWhiteboardModal, {
  type CreateWhiteboardFormData
} from '@/components/CreateWhiteboardModal';
import WhiteboardList from '@/components/WhiteboardList';

const Dashboard = (): React.JSX.Element => {
  const navigate = useNavigate();
  // const queryClient = useQueryClient();

  const title: string = "<Whiteboard App>";
  const user: User | null = useUser().user;

  const {
    isError: isOwnWhiteboardsError,
    isLoading: isOwnWhiteboardsLoading,
    isFetching: isOwnWhiteboardsFetching,
    data: ownWhiteboards,
  } = useQuery<Whiteboard[]>({
    queryKey: [user?._id, 'dashboard', 'whiteboards', 'own'],
    queryFn: async () => {
      const res = await api.get('/whiteboards/own');

      if (res.status >= 400) {
        throw new Error('Bad API call');
      } else {
        return res.data;
      }
    }
  });

  if (! user) {
    throw new Error('No user found on authenticated page');
  }

  const handleCreateWhiteboard = async (data: CreateWhiteboardFormData) => {
    const res = await api.post('/whiteboards', data);

    if (res.status >= 400) {
      alert(`Create whiteboard failed: ${res.data}`);
      console.error('Create whiteboard failed:', res.data);
    } else {
      const { _id: id } = res.data;
      const redirectUrl = `/whiteboard/${id}`;

      navigate(redirectUrl);
    }
  };

  return (
    <>
      <HeaderAuthed
        title={title}
      />

      <main>
        <h1 className="text-4xl font-bold text-center">
          Welcome Back, {user?.username}!
        </h1>

        <CreateWhiteboardModal
          onSubmit={handleCreateWhiteboard}
        />

        <h1 className="my-2 text-2xl font-bold font-mono">
          Your Whiteboards
        </h1>
        {/** TODO: replace mock data **/}
        {(() => {
          if (isOwnWhiteboardsError) {
            return (
              <WhiteboardList
                status="error"
                message={`${isOwnWhiteboardsError}`}
              />
            );
          } else if (isOwnWhiteboardsLoading || isOwnWhiteboardsFetching) {
            return (<WhiteboardList status="loading" />);
          } else {
            return (
              <WhiteboardList
                status="ready"
                whiteboardsAttribs={ownWhiteboards || []}
              />
            );
          }
        })()}

        <SharedWhiteboards />
      </main>
    </>
  );
};// end Dashboard

export default Dashboard;
