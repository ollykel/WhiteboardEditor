// === UserTag.tsx =============================================================
//
// Displays a user's basic profile information in a small, rounded button.
// Intended to be displayed within a flex-row container.
//
// Optionally clickable.
//
// =============================================================================

// -- third-party imports
import {
  cva,
} from "class-variance-authority";

import {
  X,
} from 'lucide-react';

// -- local imports
import type {
  User,
} from '@/types/UserAuth';

import {
  cn,
} from "@/lib/utils"

export type EnumUserTagSize =
  | 'small'
  | 'medium'
  | 'large'
;

type EnumUserTagRole = 
  | 'default'
  | 'button'
;

interface UserTagPropsBase {
  className?: string;
  size: EnumUserTagSize;
}

// -- displays just username and email; optional functionality on click
interface UserTagPropsBrief extends UserTagPropsBase {
  variant: 'brief';
  user: Pick<User, 'username' | 'email'> & Partial<User>;
  onClick?: (user: Pick<User, 'username' | 'email'> & Partial<User>) => any;
}

// -- displays just username and email, with a delete button; optional functionality on click
interface UserTagPropsBriefDeleter extends Omit<UserTagPropsBrief, 'variant'> {
  variant: 'brief_deleter'
  onDelete: (user: Pick<User, 'username' | 'email'> & Partial<User>) => any;
}

// -- displays just username; optional functionality on click
interface UserTagPropsUsername extends UserTagPropsBase {
  variant: 'username';
  user: Pick<User, 'username'> & Partial<User>;
  onClick?: (user: Pick<User, 'username'> & Partial<User>) => any;
}

// -- displays just username, with a delete button; optional functionality on click
interface UserTagPropsUsernameDeleter extends Omit<UserTagPropsUsername, 'variant'> {
  variant: 'username_deleter'
  onDelete: (user: Pick<User, 'username'> & Partial<User>) => any;
}

// -- displays just email; optional functionality on click
interface UserTagPropsEmail extends UserTagPropsBase {
  variant: 'email';
  user: Pick<User, 'email'> & Partial<User>;
  onClick?: (user: Pick<User, 'email'> & Partial<User>) => any;
}

// -- displays just email, with a delete button; optional functionality on click
interface UserTagPropsEmailDeleter extends Omit<UserTagPropsEmail, 'variant'> {
  variant: 'email_deleter'
  onDelete: (user: Pick<User, 'email'> & Partial<User>) => any;
}

export type UserTagProps = 
  | UserTagPropsBrief
  | UserTagPropsBriefDeleter
  | UserTagPropsUsername
  | UserTagPropsUsernameDeleter
  | UserTagPropsEmail
  | UserTagPropsEmailDeleter
;

const userTagVariants = cva(
  "inline-block align-middle rounded-2xl bg-gray-200 border-gray-600",
  {
    variants: {
      role: {
        default: "",
        button: "hover:cursor-pointer",
      },
      size: {
        small: "m-2 px-2 py-1 text-sm",
        medium: "m-4 px-4 py-2 text-md",
        large: "m-6 px-6 py-4 text-lg",
      }
    }
  }
);

// -- standardize size of lucide-react X icon across variant sizes
const getIconSizeByTagSize = (tagSize: EnumUserTagSize): number => {
  switch (tagSize) {
    case 'small':
      return 18;
    case 'medium':
      return 24;
    case 'large':
      return 32;
    default:
      // -- we should never get here
      throw new Error(`Unhandled case: ${tagSize}`);
  }
};

interface UserTagBaseProps extends UserTagPropsBase {
  role: EnumUserTagRole;
  onClick?: () => any;
}

const UserTagBase = ({
  className,
  size,
  role,
  onClick,
  children,
}: React.PropsWithChildren<UserTagBaseProps>): React.JSX.Element => {
  return (
    <div
      className={cn(userTagVariants({ size, role, className }))}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const UserTagBrief = ({
  user,
  onClick,
  ...baseProps
}: UserTagPropsBrief): React.JSX.Element => {
  const {
    username,
    email,
  } = user;

  return (
    <UserTagBase
      {...baseProps}
      role={onClick ? 'button' : 'default'}
      onClick={onClick && (() => onClick(user))}
    >
      <span>{username} ({email})</span>
    </UserTagBase>
  );
};

export const UserTagBriefDeleter = ({
  user,
  onClick,
  onDelete,
  ...baseProps
}: UserTagPropsBriefDeleter): React.JSX.Element => {
  const {
    username,
    email,
  } = user;

  return (
    <UserTagBase
      {...baseProps}
      role={onClick ? 'button' : 'default'}
      onClick={onClick && (() => onClick(user))}
    >
      <button
        onClick={() => onDelete(user)}
        className="hover:cursor-pointer p-1 inline-block align-middle"
      >
        <X size={getIconSizeByTagSize(baseProps.size)} />
      </button>
      <span>{username} ({email})</span>
    </UserTagBase>
  );
};

export const UserTagUsername = ({
  user,
  onClick,
  ...baseProps
}: UserTagPropsUsername): React.JSX.Element => {
  const {
    username
  } = user;

  return (
    <UserTagBase
      {...baseProps}
      role={onClick ? 'button' : 'default'}
      onClick={onClick && (() => onClick(user))}
    >
      <span>{username}</span>
    </UserTagBase>
  );
};

export const UserTagUsernameDeleter = ({
  user,
  onClick,
  onDelete,
  ...baseProps
}: UserTagPropsUsernameDeleter): React.JSX.Element => {
  const {
    username,
  } = user;

  return (
    <UserTagBase
      {...baseProps}
      role={onClick ? 'button' : 'default'}
      onClick={onClick && (() => onClick(user))}
    >
      <button
        onClick={() => onDelete(user)}
        className="hover:cursor-pointer p-1 inline-block align-middle"
      >
        <X size={getIconSizeByTagSize(baseProps.size)} />
      </button>
      <span>{username}</span>
    </UserTagBase>
  );
};

// interface UserTagPropsEmail extends UserTagPropsBase {
export const UserTagEmail = ({
  user,
  onClick,
  ...baseProps
}: UserTagPropsEmail): React.JSX.Element => {
  const {
    email,
  } = user;

  return (
    <UserTagBase
      {...baseProps}
      role={onClick ? 'button' : 'default'}
      onClick={onClick && (() => onClick(user))}
    >
      <span>{email}</span>
    </UserTagBase>
  );
};

export const UserTagEmailDeleter = ({
  user,
  onClick,
  onDelete,
  ...baseProps
}: UserTagPropsEmailDeleter): React.JSX.Element => {
  const {
    email,
  } = user;

  return (
    <UserTagBase
      {...baseProps}
      role={onClick ? 'button' : 'default'}
      onClick={onClick && (() => onClick(user))}
    >
      <button
        onClick={() => onDelete(user)}
        className="hover:cursor-pointer p-1 inline-block align-middle"
      >
        <X size={getIconSizeByTagSize(baseProps.size)} />
      </button>
      <span>{email}</span>
    </UserTagBase>
  );
};

export const UserTag = (props: UserTagProps): React.JSX.Element => {
  switch (props.variant) {
    case 'brief':
      return (<UserTagBrief {...props} />);
    case 'brief_deleter':
      return (<UserTagBriefDeleter {...props} />);
    case 'username':
      return (<UserTagUsername {...props} />);
    case 'username_deleter':
      return (<UserTagUsernameDeleter {...props} />);
    case 'email':
      return (<UserTagEmail {...props} />);
    case 'email_deleter':
      return (<UserTagEmailDeleter {...props} />);
    default:
      // -- we should never get here
      throw new Error(`Unhandled variant: ${props}`);
  }
};
