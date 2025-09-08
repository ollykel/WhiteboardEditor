// -- std imports
import { useNavigate } from 'react-router-dom';

// -- local imports

// -- api
import api from '@/api/axios';

// -- components
import HeaderAuthed from "@/components/HeaderAuthed";
import YourWhiteboards from "@/components/YourWhiteboards";
import SharedWhiteboards from "@/components/SharedWhiteboards";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/types/UserAuth";
import CreateWhiteboardModal, {
  type CreateWhiteboardFormData
} from '@/components/CreateWhiteboardModal';

const Dashboard = (): React.JSX.Element => {
  const navigate = useNavigate();

  const title: string = "<Whiteboard App>";
  const user: User = useUser().user;

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

        <YourWhiteboards />
        <SharedWhiteboards />
      </main>
    </>
  );
};// end Dashboard

export default Dashboard;
