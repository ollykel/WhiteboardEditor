import Canvas from "@/components/Canvas";

// TODO: Swap out hardcoded placeholder array with dynamic data
const tools = ["Vector Tool", "Rectangle", "Ellipse", "Import Image", "New Canvas"];

function Whiteboard() {
  return (
    <main id="whiteboard-main">
      <div>
      
      </div>
      <aside id="whiteboard-toolbar"> {/* TODO: separate into sidebar component */}
        <h2>Tools</h2>
        {tools.map((tool) => {
          return (
            <h3>{tool}</h3>
          );
        })}
      </aside>

      <Canvas
        width={512}
        height={512}
      />
    </main>
  );
}

export default Whiteboard;