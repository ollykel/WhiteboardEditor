interface HeaderButtonProps {
  onClick?: () => void;
  title: string;
}

function HeaderButton({ onClick, title }: HeaderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-xl hover:bg-gray-200"
    >
      {title}
    </button>
  );
}

export default HeaderButton;