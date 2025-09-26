// === Page.tsx ================================================================
//
// Wrapper component for all pages. Sets the window title on render.
//
// =============================================================================

// -- std imports
import {
  useEffect,
  type PropsWithChildren,
} from 'react';

export interface PageProps {
  title: string;
}

const Page = ({
  title,
  children,
}: PropsWithChildren<PageProps>): React.JSX.Element => {
  // -- set page title on render
  useEffect(
    () => {
      window.document.title = title;
    },
    [title]
  );

  return (
    <div>
      {children}
    </div>
  );
};

export default Page;
