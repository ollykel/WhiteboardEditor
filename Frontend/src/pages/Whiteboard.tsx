import Canvas from "@/components/Canvas";

// TODO: Swap out hardcoded placeholders with dynamic data
const tools = ["Vector Tool", "Rectangle", "Ellipse", "Import Image", "New Canvas"];
const title = "My First Whiteboard";

function Whiteboard() {
  return (
    <main id="whiteboard-main">
      <div id="whiteboard-header">
        <h1>{title}</h1>
      </div>
      <div id="whiteboard-content">   
        <aside id="whiteboard-toolbar"> {/* TODO: separate into sidebar component */}
          <h2>Tools</h2>
          {tools.map((tool) => {
            return (
              <h3>{tool}</h3>
            );
          })}
        </aside>
        <div id="canvas-container">
          <Canvas
            width={512}
            height={512}
          />
          <Canvas
            width={512}
            height={512}
          />
        </div>
      </div>
    </main>
  );
}

export default Whiteboard;