import CreateCanvasInput from "./CreateCanvasInput";

function CreateCanvasMenu() {
  const handleCreate = () => {
    console.log("New Canvas Created");
  };

  return (
    <div className="flex ">
      <h2>Create New Canvas</h2>
      <form action="">
        <CreateCanvasInput>

        </CreateCanvasInput>
        USERS
      </form>
      <button onClick={handleCreate}>CREATE</button>
    </div>
  );
}

export default CreateCanvasMenu;