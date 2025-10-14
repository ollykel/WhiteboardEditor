// === Sidebar =================================================================
//
// Container for elements which lie fixed along one side of the page.
//
// Useful for toolbars and menus that need to be visible at all times.
//
// =============================================================================

// -- std imports
import type { PropsWithChildren } from 'react';

export interface SidebarProps {
  side: 'left' | 'right';
  width?: string;  // as a tailwind className
  zIndex?: number;
}

const Sidebar = ({
  side,
  width = '10em',
  zIndex = 50,
  children,
}: PropsWithChildren<SidebarProps>): React.JSX.Element => {
  return (
    <aside
      className={`fixed top-1/2 -translate-y-1/2 ${side}-2 ${width} flex flex-col flex-shrink-0`}
      style={{ zIndex }}
    >
      {children}
    </aside>
  );
};

export default Sidebar;
