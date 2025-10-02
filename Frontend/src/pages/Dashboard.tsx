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

import Page from '@/components/Page';

// -- components
import HeaderAuthed from "@/components/HeaderAuthed";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/UserAuth";
import CreateWhiteboardModal, {
  type CreateWhiteboardFormData
} from '@/components/CreateWhiteboardModal';
import WhiteboardList from '@/components/WhiteboardList';

const Dashboard = (): React.JSX.Element => {
  const navigate = useNavigate();
  const title: string = "<Whiteboard App>";
  const user: User | null = useUser().user;

  const {
    isError: isOwnWhiteboardsError,
    isLoading: isOwnWhiteboardsLoading,
    isFetching: isOwnWhiteboardsFetching,
    data: ownWhiteboards,
  } = useQuery<Whiteboard[]>({
    queryKey: [user?.id, 'dashboard', 'whiteboards', 'own'],
    queryFn: async () => {
      const res = await api.get('/whiteboards/own');

      if (res.status >= 400) {
        throw new Error('Bad API call');
      } else {
        return res.data;
      }
    }
  });

  const {
    isError: isSharedWhiteboardsError,
    isLoading: isSharedWhiteboardsLoading,
    isFetching: isSharedWhiteboardsFetching,
    data: sharedWhiteboards,
  } = useQuery<Whiteboard[]>({
    queryKey: [user?.id, 'dashboard', 'whiteboards', 'shared'],
    queryFn: async () => {
      const res = await api.get('/users/me/shared_whiteboards');

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
      const {
        id,
      } = res.data;

      if (! id) {
        throw new Error('Received no Whiteboard ID from API response');
      }

      const redirectUrl = `/whiteboard/${id}`;

      navigate(redirectUrl);
    }
  };

  const pageTitle = 'Your Dashboard | Whiteboard Editor';

  return (
    <Page
      title={pageTitle}
    >
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

        <h1 className="my-2 text-2xl font-bold font-mono">
          Shared Whiteboards
        </h1>
        {(() => {
          if (isSharedWhiteboardsError) {
            return (
              <WhiteboardList
                status="error"
                message={`${isSharedWhiteboardsError}`}
              />
            );
          } else if (isSharedWhiteboardsLoading || isSharedWhiteboardsFetching) {
            return (<WhiteboardList status="loading" />);
          } else {
            return (
              <WhiteboardList
                status="ready"
                whiteboardsAttribs={sharedWhiteboards || []}
              />
            );
          }
        })()}
      </main>
    </Page>
  );
};// end Dashboard

export default Dashboard;
