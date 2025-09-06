import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function CanvasMenu() {
  const handleViewMain = () => {
    console.log("view main screen clicked")
  }
  const handleEditUsers = () => {
    console.log("edit users clicked");
  }

  const handleDelete = () => {
    console.log("delete clicked");
  }

  const handleRequestAccess = () => {
    console.log("request access clicked");
  }

  const handleDownload = () => {
    console.log("download clicked");
  }

  const handleMerge = () => {
    console.log("merge clicked");
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Canvas Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem
            onSelect={handleViewMain}
          >
            View Main Screen
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleEditUsers}
          >
            Edit Users
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleDelete}
          >
            Delete Canvas
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleRequestAccess}
          >
            Request Access
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleDownload}
          >
            Download
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={handleMerge}
          >
            Merge with Main
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
  );
}

export default CanvasMenu;