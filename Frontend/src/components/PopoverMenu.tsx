import type { ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PopoverMenuProps {
  trigger: ReactNode
  children: ReactNode
  width?: string // allow flexible width
  open?: boolean; // optional controlled open state
  onOpenChange?: (open: boolean) => void; // optional callback for state changes
}

function PopoverMenu({ 
  trigger,
  children,
  width = "w-64",
  open,
  onOpenChange,
}: PopoverMenuProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className={width}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

export default PopoverMenu;