// -- std imports
import { useContext } from 'react';
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

// -- local imports
import AuthContext from '@/context/AuthContext';

export interface ProtectedRouteProps {
  fallback: string;
}

const ProtectedRoute = (props: PropsWithChildren<ProtectedRouteProps>): React.JSX.Element => {
  const { fallback, children } = props;
  const authContext = useContext(AuthContext);

  if (! authContext) {
    throw new Error('No auth context provided');
  }

  const { user } = authContext;

  if (! user) {
    // not logged in 
    const locationEncoded = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    const redirectUrl = `${fallback}?redirect=${locationEncoded}`;

    return (
      <Navigate to={redirectUrl} replace />
    );
  } else {
    return (
      <>
        {children}
      </>
    );
  }
};

export default ProtectedRoute;
