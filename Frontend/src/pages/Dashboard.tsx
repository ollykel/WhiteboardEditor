// -- std imports
import { useNavigate } from 'react-router-dom';

// -- third-party imports

import {
  useQuery,
  // useQueryClient,
} from '@tanstack/react-query';

// -- local imports

import {
  APP_NAME,
} from '@/app.config';

// -- api
import api from '@/api/axios';

import {
  type AxiosResponse,
} from 'axios';

import type {
  Whiteboard,
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
  const pageTitle = `Your Dashboard | ${APP_NAME}`;
  const user: User | null = useUser().user;

  const {
    isError: isOwnWhiteboardsError,
    isLoading: isOwnWhiteboardsLoading,
    isFetching: isOwnWhiteboardsFetching,
    data: ownWhiteboards,
  } = useQuery<Whiteboard[]>({
    queryKey: [user?.id, 'dashboard', 'whiteboards', 'own'],
    queryFn: async () => {
      const res : AxiosResponse<Whiteboard[]> = await api.get('/whiteboards/own');

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
      const res : AxiosResponse<Whiteboard[]> = await api.get('/users/me/shared_whiteboards');

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
    const res : AxiosResponse<Whiteboard> = await api.post('/whiteboards', data);

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

  return (
    <Page
      title={pageTitle}
    >
      <HeaderAuthed
        title={APP_NAME}
      />

      <main>
        <h1 className="text-xl md:text-4xl text-h1-text text-center m-5">
          Welcome Back, {user?.username}!
        </h1>

        <div className='text-center lg:text-left m-4 lg:ml-60 lg:mb-12'>
          <CreateWhiteboardModal
            onSubmit={handleCreateWhiteboard}
          />
        </div>

        <h1 className="pt-12 mb-8 mx-24 text-center lg:text-left lg:pl-36 text-2xl text-h2-text font-bold font-mono border-t-1 border-border">
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

        <h1 className="pt-12 my-8 mx-24 text-center lg:text-left lg:pl-36 text-2xl text-h2-text font-bold font-mono border-t-1 border-border">
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
