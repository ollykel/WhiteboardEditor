import Header from "@/components/Header";
import YourWhiteboards from "@/components/YourWhiteboards";
import SharedWhiteboards from "@/components/SharedWhiteboards";

function Dashboard() {
  const title: string = "<Whiteboard App>";
  const username: string = "<User>";

  return (
    <div>
      <Header title={title}/>
      <h1 className="mt-25 ml-10 text-4xl font-bold">
        Welcome Back, {username}!
      </h1>
      <YourWhiteboards />
      <SharedWhiteboards />
    </div>
  );
}

export default Dashboard;