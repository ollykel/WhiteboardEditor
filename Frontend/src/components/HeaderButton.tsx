import {
  Link,
} from 'react-router-dom';

// -- third-party imports
import {
  cva,
} from "class-variance-authority"

// -- local imports
import {
  cn,
} from "@/lib/utils"

const buttonVariants = cva(
  "px-4 py-2 rounded-lg",
  {
    variants: {
      variant: {
        default: "hover:cursor-pointer hover:bg-gray-200",
        disabled: "bg-gray-200 text-gray-400"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface HeaderButtonProps {
  // If to is present renders a link, if onClick is present renders a button
  to?: string;
  onClick?: () => void;
  title: string;
  disabled?: boolean;
}

function HeaderButton({
  to,
  onClick,
  title,
  disabled = false,
}: HeaderButtonProps) {
  const className = cn(buttonVariants({
    variant: disabled ? 'disabled' : 'default'
  }));

  if (to) {
    return (
      <Link
        to={to}
        className={className}
        inert={disabled}
      >
        {title}
      </Link>
    ); 
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {title}
    </button>
  );
}

export default HeaderButton;
