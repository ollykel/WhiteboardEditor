import WhiteboardCard from "@/components/WhiteboardCard";

function YourWhiteboards() {
  return (
    <div className="m-10">
      <div className="text-2xl font-bold">
        Your Whiteboards
      </div>
      <WhiteboardCard
        id="dummyYourID"
        name="Dummy Whiteboard"
        time_created={new Date()}
        user_permissions={[]}
      /> {/* TODO: Map the list of your whiteboards */}
    </div>
  );
}

export default YourWhiteboards;
