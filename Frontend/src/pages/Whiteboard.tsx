import Canvas from "@/components/Canvas";

// Hardcoded placeholder
const tools = ["Vector Tool", "Rectangle", "Ellipse", "Import Image", "New Canvas"];

function Whiteboard() {
  return (
    <main id="whiteboard-main">
      <aside>
      {/* TODO: separate into sidebar component */}

      </aside>

      <Canvas
        width={512}
        height={512}
      />
    </main>
  );
}

export default Whiteboard;