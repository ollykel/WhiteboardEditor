import CanvasCard from "@/components/CanvasCard";

// TODO: Swap out hardcoded placeholders with dynamic data
const tools = ["Vector Tool", "Rectangle", "Ellipse", "Import Image", "New Canvas"];
const title = "My First Whiteboard";

function Whiteboard() {
  return (
    <main className="flex flex-col justify-center">
      {/* Header | TODO: separate into Header component */}
      <div 
        className="text-center shadow-md rounded-2xl mx-20"
      > 
        <h1>{title}</h1>
      </div>
      {/* Content */}
      <div className="flex flex-1 justify-center items-center">   
        {/* Toolbar */}
        <aside className="flex flex-col flex-shrink-0 text-center p-4 m-4 rounded-2xl shadow-md"> {/* TODO: separate into Sidebar component */}
          <h2>Tools</h2>
          {tools.map((tool) => {
            return (
              <h3>{tool}</h3>
            );
          })}
        </aside>
        {/* Canvas Container */}
        <div className="flex flex-1 flex-row justify-around m-8 flex-wrap">
          <CanvasCard title="Canvas A"></CanvasCard>
          <CanvasCard title="Canvas B"></CanvasCard>
          {/* <CanvasCard title="Canvas C"></CanvasCard> */}
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;