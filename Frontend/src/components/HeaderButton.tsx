import { Link } from 'react-router-dom';

interface HeaderButtonProps {
  // If to is present renders a link, if onClick is present renders a button
  to?: string;
  onClick?: () => void;
  title: string;
}

function HeaderButton({ to, onClick, title }: HeaderButtonProps) {
  const baseClasses = "px-4 py-2 hover:cursor-pointer rounded-lg hover:bg-gray-200";

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {title}
      </Link>
    ); 
  }

  return (
    <button
      onClick={onClick}
      className={baseClasses}
    >
      {title}
    </button>
  );
}

export default HeaderButton;