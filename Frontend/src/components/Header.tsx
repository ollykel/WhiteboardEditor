interface HeaderProps {
  title: string;
}

function Header({ title }: HeaderProps) {
  return (
    <div className="fixed top-1 left-0 right-0 max-h-15 text-center shadow-md rounded-2xl mx-20 m-1 p-3 bg-stone-50"> 
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}

export default Header;