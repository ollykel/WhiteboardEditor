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
  zIndex = 50,
  children,
}: PropsWithChildren<SidebarProps>): React.JSX.Element => {
  return (
    <aside
      className={`fixed top-[20%] ${side}-2 flex flex-wrap flex-col items-start justify-center gap-2 max-h-[70vh]`}
      style={{ zIndex }}
    >
      {children}
    </aside>
  );
};

export default Sidebar;
