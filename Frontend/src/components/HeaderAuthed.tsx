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
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@radix-ui/react-navigation-menu';

export type HeaderAuthedProps = HeaderProps;

const HeaderAuthed = ({
  toolbarElemsLeft = [],
  toolbarElemsRight = [],
  ...props
}: HeaderAuthedProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();

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
        // Active Users
        
        // Profile Dropdown
        (
          <NavigationMenu className="absolute">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  {user?.username}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex flex-col">
                    <NavigationMenuLink asChild>
                      <HeaderButton 
                        to="/account"
                        title="Settings"
                      /> 
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <HeaderButton 
                        onClick={handleLogOut}
                        title="Log Out"
                      />
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        ),
      ]}
    />
  );
};

export default HeaderAuthed;
