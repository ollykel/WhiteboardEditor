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

export type HeaderAuthedProps = HeaderProps;

const HeaderAuthed = ({
  title,
  toolbarElemsLeft = [],
  toolbarElemsRight = []
}: HeaderAuthedProps): React.JSX.Element => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogOut = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <Header
      title={title}
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
          <HeaderButton 
            to="/account"
            title="Settings"
          />
        ),
        (
          <HeaderButton 
            onClick={handleLogOut}
            title="Log Out"
          />
        )
      ]}
    />
  );
};

export default HeaderAuthed;
