import type { ReactNode } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface PopoverMenuProps {
  trigger: ReactNode
  children: ReactNode
  width?: string // allow flexible width
}

function PopoverMenu({ trigger, children, width = "w-64" }: PopoverMenuProps) {
  return (
    <Popover>
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