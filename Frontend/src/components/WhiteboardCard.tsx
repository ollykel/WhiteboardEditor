function WhiteboardCard() {
  return (
    <div className="flex flex-col justify-center m-10 p-5 w-50 rounded-xl shadow">
      <img src="/images/Screenshot 2025-08-17 at 1.16.54 PM.png" alt="Whiteboard Thumbnail" />
      <h1 className=" text-lg font-bold">Title</h1>
      <h2 className="">Owner: </h2>
      <h3 className="">Collaborators: </h3>
    </div>
  );
}

export default WhiteboardCard;