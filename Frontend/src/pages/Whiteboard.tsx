import CanvasCard from "@/components/CanvasCard";

// TODO: Swap out hardcoded placeholders with dynamic data
const tools = ["Vector Tool", "Rectangle", "Ellipse", "Import Image", "New Canvas"];
const title = "My First Whiteboard";

const Whiteboard = () => {
  return (
    <main className="flex flex-col justify-center"> {/* Might not need this to be flex anymore */}
      {/* Header | TODO: separate into Header component */}
      <div className="fixed top-1 left-0 right-0 max-h-15 text-center shadow-md rounded-2xl mx-20 m-1 p-3 bg-stone-50"> 
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {/* Content */}
      <div className="flex flex-1 justify-center items-center mt-20"> {/* Might not need this to be flex anymore */}
        {/* Toolbar */}
        <aside className="fixed top-1/2 -translate-y-1/2 left-2 max-w-40 flex flex-col flex-shrink-0 text-center p-4 m-1 rounded-2xl shadow-md  bg-stone-50"> {/* TODO: separate into Sidebar component */}
          <h2 className="text-2xl font-bold mb-4">Tools</h2>
          {tools.map((tool) => {
            return (
              <h3 className="m-2">{tool}</h3>
            );
          })}
        </aside>
        {/* Canvas Container */}
        <div className="flex flex-1 flex-row justify-center flex-wrap ml-40">
          <CanvasCard title="Canvas A"></CanvasCard>
          <CanvasCard title="Canvas B"></CanvasCard>
          <CanvasCard title="Canvas C"></CanvasCard>
          <CanvasCard title="Canvas D"></CanvasCard>
          <CanvasCard title="Canvas E"></CanvasCard>
          <CanvasCard title="Canvas F"></CanvasCard>
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;
