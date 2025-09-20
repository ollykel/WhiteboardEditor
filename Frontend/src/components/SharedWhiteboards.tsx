import WhiteboardCard from "./WhiteboardCard";

function SharedWhiteboards() {
  return (
    <div className="m-10">
      <div className="text-2xl font-bold">
        Shared Whiteboards
      </div>
      {/* TODO: Map the list of shared whiteboards */}
      <WhiteboardCard
        id="dummySharedID"
        name="Dummy Shared Whiteboard"
      /> 
    </div>
  );
}

export default SharedWhiteboards;
