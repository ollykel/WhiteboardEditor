import WhiteboardCard from "./WhiteboardCard";

function SharedWhiteboards() {
  return (
    <div className="m-10">
      <div className="text-2xl font-bold">
        Shared Whiteboards
      </div>
      <WhiteboardCard id="dummySharedID" /> {/* TODO: Map the list of shared whiteboards */}
    </div>
  );
}

export default SharedWhiteboards;