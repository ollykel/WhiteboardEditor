import CanvasCard from "@/components/CanvasCard";

// TODO: Swap out hardcoded placeholders with dynamic data
const tools = ["Vector Tool", "Rectangle", "Ellipse", "Import Image", "New Canvas"];
const title = "My First Whiteboard";

function Whiteboard() {
  return (
    <main id="whiteboard-main">
      <div id="whiteboard-header"> {/* TODO: separate into Header component */}
        <h1>{title}</h1>
      </div>
      <div id="whiteboard-content">   
        <aside id="whiteboard-toolbar"> {/* TODO: separate into Sidebar component */}
          <h2>Tools</h2>
          {tools.map((tool) => {
            return (
              <h3>{tool}</h3>
            );
          })}
        </aside>
        <div id="canvas-container">
          <CanvasCard title="Canvas A"></CanvasCard>
          <CanvasCard title="Canvas B"></CanvasCard>
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;