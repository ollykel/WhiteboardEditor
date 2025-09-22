import WhiteboardCard from "./WhiteboardCard";

function SharedWhiteboards() {
  return (
    <div className="m-10">
      <div className="text-2xl font-bold">
        Shared Whiteboards
      </div>
      {/* TODO: Map the list of shared whiteboards */}
      <WhiteboardCard
        _id="dummySharedID"
        name="Dummy Shared Whiteboard"
        time_created={new Date()}
        owner={{
          _id: 'efgh',
          username: 'Bob',
          email: 'bob@example.com',
        }}
        shared_users={[]}
      /> {/* TODO: Map the list of your whiteboards */}
    </div>
  );
}

export default SharedWhiteboards;
