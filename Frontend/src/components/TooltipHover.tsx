import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import React from "react";

interface TooltipHoverProps {
  children: React.ReactElement;
  text: string;
}

const TooltipHover = ({ children, text }: TooltipHoverProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {React.cloneElement(children)}
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  )
};

export default TooltipHover;