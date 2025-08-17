import Header from "@/components/Header";

function Dashboard() {
  const title: string = "<Whiteboard App>";
  const username: string = "<User>";

  return (
    <div>
      <Header title={title}/>
      <h1 className="mt-20 ml-10 text-4xl font-bold">
        Welcome Back, {username}!
      </h1>
    </div>
  );
}

export default Dashboard;