import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function CanvasMenu() {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Canvas Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem>View Main Screen</DropdownMenuItem>
          <DropdownMenuItem>Edit Users</DropdownMenuItem>
          <DropdownMenuItem>Delete Canvas</DropdownMenuItem>
          <DropdownMenuItem>Request Access</DropdownMenuItem>
          <DropdownMenuItem>Download</DropdownMenuItem>
          <DropdownMenuItem>Merge with Main</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}

export default CanvasMenu;