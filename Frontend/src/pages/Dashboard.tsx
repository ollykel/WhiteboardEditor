import { useNavigate } from "react-router";

import Header from "@/components/Header";
import YourWhiteboards from "@/components/YourWhiteboards";
import SharedWhiteboards from "@/components/SharedWhiteboards";
import { useUser } from "../hooks/useUser";

import type { User } from "../types/UserAuth";

function Dashboard() {
  const title: string = "<Whiteboard App>";
  const user: User = useUser().user;
  const navigate = useNavigate();

  const createNewWhiteboard = () => {
    navigate("/whiteboard/new");
  }

  return (
    <div>
      <Header title={title}/>
      <h1 className="text-4xl font-bold text-center">
        Welcome Back, {user?.username}!
      </h1>
      <button
        onClick={createNewWhiteboard}
        className="flex flex-col items-center justify-center ml-10 mt-10 p-4 shadow rounded-lg hover:bg-gray-200 hover:cursor-pointer bg-stone-50"
      >
        + New Whiteboard
      </button>
      <YourWhiteboards />
      <SharedWhiteboards />
    </div>
  );
}

export default Dashboard;
