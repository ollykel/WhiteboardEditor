import HeaderButton from "./HeaderButton";

interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <div className="fixed z-50 top-1 left-0 right-0 max-h-15 shadow-md rounded-2xl mx-20 m-1 p-3 bg-stone-50"> 
      <div className="relative flex items-center justify-center">
        <div className="absolute left-2">
          <HeaderButton 
            onClick={() => console.log("Home clicked")}
            title="Home"
          /> {/* TODO: Implement home (dashboard) */}
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="absolute right-2">
          <HeaderButton 
            onClick={() => console.log("Share clicked")}
            title="Share"
          /> {/* TODO: Implement sharing function */}
          <HeaderButton 
            title="Settings"
          />
          <HeaderButton 
            title="Log In"
          />
          <HeaderButton 
            title="Sign Up"
          />
        </div>
      </div>
    </div>
  );
}

export default Header;