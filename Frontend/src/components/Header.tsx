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
  noMarginTop?: boolean;
}

const Header = ({
  title,
  zIndex = 50,
  toolbarElemsLeft = [],
  toolbarElemsRight = [],
  noMarginTop,
}: HeaderProps): React.JSX.Element => {
  return (
    <>
      {/** Floating header **/}
      <div
        className="fixed top-1 left-0 right-0 max-h-15 shadow-md rounded-lg mx-5 lg:mx-30 m-1 px-3 py-1 bg-stone-50"
        style={{ zIndex }}
      > 
        <div className="relative flex items-center justify-between"> 

          {/* Hamburger Menu */}
          <NavigationMenu className="md:hidden">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <TextAlignJustify />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex flex-col">
                    {toolbarElemsLeft.map((elem, idx) => (
                      <NavigationMenuLink asChild key={idx}>
                        {elem}
                      </NavigationMenuLink>
                    ))}
                    {toolbarElemsRight.map((elem, idx) => (
                      <NavigationMenuLink asChild key={`right-${idx}`}>
                        {elem}
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Left Side Items */}
          <div className="mx-4 gap-4 hidden md:flex w-60 items-center">
            {toolbarElemsLeft}
          </div>

          {/* Title */}
          <h1 className="flex-1 min-w-0 text-lg md:text-2xl font-bold truncate text-center">
            {title}
          </h1>
          
          {/* Right Side Items */}
          <div className="mx-4 gap-4 hidden md:flex w-60 items-center justify-end">
            {toolbarElemsRight}
          </div>
        </div>
      </div>
      {/** Dummy static element to ensure header doesn't overlap top of page **/}
      {(!noMarginTop &&
        <div className="h-20">
        </div>
      )}
    </>
  );
};

export default Header;
