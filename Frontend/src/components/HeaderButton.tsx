interface HeaderButtonProps {
  onClick?: () => void;
  title: string;
}

function HeaderButton({ onClick, title }: HeaderButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 hover:cursor-pointer rounded-lg hover:bg-gray-200"
    >
      {title}
    </button>
  );
}

export default HeaderButton;