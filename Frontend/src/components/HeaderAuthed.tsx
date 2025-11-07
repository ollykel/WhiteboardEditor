// === HeaderAuthed ============================================================
//
// Framework for header to display when a user is logged in. Allows extension to
// set title and add buttons and other elements to the left and right sides of
// the header.
//
// =============================================================================

import { useNavigate } from 'react-router-dom';

import { useUser } from '@/hooks/useUser';

import Header, {
  type HeaderProps
} from '@/components/Header';

import HeaderButton from '@/components/HeaderButton';
import { useSelector } from 'react-redux';
import { selectActiveUsers } from '@/store/activeUsers/activeUsersSelectors';
import type { ClientIdType, UserSummary } from '@/types/WebSocketProtocol';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger, 
} from './ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

export type HeaderAuthedProps = HeaderProps;

const HeaderAuthed = ({
  toolbarElemsLeft = [],
  toolbarElemsRight = [],
  ...props
}: HeaderAuthedProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

  const activeUsers : Record<ClientIdType, UserSummary> = useSelector(selectActiveUsers);

  const handleLogOut = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <Header
      {...props}
      toolbarElemsLeft={[
        (
          <HeaderButton 
            to={"/dashboard"}
            title="Home"
          />
        ),
        ...toolbarElemsLeft
      ]}
      toolbarElemsRight={[
        ...toolbarElemsRight,
        (
          // TODO: Abstract out a generic dropdown menu
          // Active Users
          <DropdownMenu key="active-users">
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-gray-200 whitespace-nowrap">
              Active Users
              <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="flex flex-col">
                {Object.values(activeUsers).map((u) => (
                  <DropdownMenuLabel key={u.clientId}>
                    {u.username}
                  </DropdownMenuLabel>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        (
          // Profile Dropdown
          <DropdownMenu key="profile">
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-xl font-bold rounded-md hover:cursor-pointer hover:bg-gray-200">
              {user?.username}
              <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=open]:rotate-180"/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='flex flex-col items-center'>
              <DropdownMenuItem asChild>
                <HeaderButton 
                  to="/account" 
                  title="Settings" 
                /> 
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <HeaderButton 
                  onClick={handleLogOut}
                  title="Log Out" 
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      ]}
    />
  );
};

export default HeaderAuthed;
