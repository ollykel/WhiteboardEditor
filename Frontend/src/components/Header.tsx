import ShareButton from "./ShareButton";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <div className="fixed top-1 left-0 right-0 max-h-15 shadow-md rounded-2xl mx-20 m-1 p-3 bg-stone-50"> 
      <div className="relative flex items-center justify-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="absolute right-4">
          <ShareButton onShare={() => console.log("Share clicked")}/> {/* TODO: Implement sharing function */}
        </div>
      </div>
    </div>
  );
}

export default Header;