function WhiteboardCard() {
  return (
    <div className="flex flex-col justify-center m-10 w-75 rounded-xl shadow bg-stone-50">
      <img src="/images/Screenshot 2025-08-17 at 1.16.54 PM.png" alt="Whiteboard Thumbnail" />
      <div className="p-5">
        <h1 className=" text-lg font-bold">Title</h1>
        <h2 className="">Owner: </h2>
        <h3 className="">Collaborators: </h3>
      </div>
    </div>
  );
}

export default WhiteboardCard;