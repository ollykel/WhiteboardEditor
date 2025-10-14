// === HeaderUnauthed ==========================================================
//
// Framework for header to display when a user is not logged in. Allows extension to
// set title and add buttons and other elements to the left and right sides of
// the header.
//
// =============================================================================

import Header, {
  type HeaderProps
} from '@/components/Header';

import HeaderButton from '@/components/HeaderButton';

export type HeaderUnauthedProps = HeaderProps;

const HeaderUnauthed = ({
  toolbarElemsLeft = [],
  toolbarElemsRight = [],
  ...props
}: HeaderUnauthedProps): React.JSX.Element => {
  return (
    <Header
      {...props}
      toolbarElemsLeft={toolbarElemsLeft}
      toolbarElemsRight={[
        ...toolbarElemsRight,
        (
          <HeaderButton 
            to={"/login"}
            title="Log in"
          />
        ),
        (
          <HeaderButton 
            to="/signup"
            title="Create Account"
          />
        ),
      ]}
    />
  );
};

export default HeaderUnauthed;
