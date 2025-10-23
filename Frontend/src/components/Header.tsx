import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

import {
  TextAlignJustify,
} from "lucide-react";

// === Header ==================================================================
//
// Framework for displaying a floating header at the top of a page. Allows
// setting the title and adding buttons and other elements to toolbars on the
// left and right sides.
//
// =============================================================================

export interface HeaderProps {
  title: string;
  zIndex?: number;
  // Buttons and other elements to display on left side of header
  toolbarElemsLeft?: React.JSX.Element[];
  // Buttons and other elements to display on right side of header
  toolbarElemsRight?: React.JSX.Element[];
}

const Header = ({
  title,
  zIndex = 50,
  toolbarElemsLeft = [],
  toolbarElemsRight = []
}: HeaderProps): React.JSX.Element => {
  return (
    <>
      {/** Floating header **/}
      <div
        className="fixed top-1 left-0 right-0 max-h-15 shadow-md rounded-lg mx-5 lg:mx-20 m-1 p-3 bg-stone-50"
        style={{ zIndex }}
      > 
        <div className="relative flex items-center justify-center">
          {/* Hamburger Menu */}
          <NavigationMenu className="absolute left-2 md:hidden">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <TextAlignJustify />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <NavigationMenuLink href="">Link</NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="absolute left-2 hidden md:flex">
            {toolbarElemsLeft}
          </div>

          <h1 className="text-lg md:text-2xl font-bold">{title}</h1>
          
          <div className="absolute right-2 hidden md:flex">
            {toolbarElemsRight}
          </div>
        </div>
      </div>
      {/** Dummy static element to ensure header doesn't overlap top of page **/}
      <div className="h-20">
      </div>
    </>
  );
};

export default Header;
