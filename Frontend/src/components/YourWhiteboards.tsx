import WhiteboardCard from "@/components/WhiteboardCard";

function YourWhiteboards() {
  return (
    <div className="m-10">
      <div className="text-2xl font-bold">
        Your Whiteboards
      </div>
      <WhiteboardCard
        _id="dummyYourID"
        name="Dummy Whiteboard"
        time_created={new Date()}
        owner={{
          _id: 'abcd',
          username: 'Dummy User',
          email: 'dummy@example.com'
        }}
      /> {/* TODO: Map the list of your whiteboards */}
    </div>
  );
}

export default YourWhiteboards;
