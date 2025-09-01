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

const defaultSidebarProps = ({
  width: '10em',
  zIndex: 50
});

const Sidebar = (props: PropsWithChildren<SidebarProps>): React.JSX.Element => {
  const propsFull = ({
    ...defaultSidebarProps,
    ...props
  });

  const {
    side,
    width,
    zIndex,
    children
  } = propsFull;

  return (
    <aside className={`fixed z-${zIndex} top-1/2 -translate-y-1/2 ${side}-2 ${width} flex flex-col flex-shrink-0`}>
      {children}
    </aside>
  );
};

export default Sidebar;
