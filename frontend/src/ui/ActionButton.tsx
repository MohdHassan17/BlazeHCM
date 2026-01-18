import React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import { Button } from "../components/ui/button";

interface ActionButtonProps {
  onClick: () => void;
  /** Accept either an icon element (eg. `<X />`) or an icon component (eg. `X`) */
  icon: React.ReactElement | React.ComponentType<any>;
  toolTipText: string;
  variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link";
}
function ActionButton({
  onClick,
  icon,
  toolTipText,
  variant,
}: ActionButtonProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={onClick} variant={variant} size="icon">
            {React.isValidElement(icon)
              ? icon
              : React.createElement(icon as React.ComponentType<any>)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{toolTipText}</TooltipContent>
      </Tooltip>
    </>
  );
}

export default ActionButton;
