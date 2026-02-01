import type { ReactNode } from "react";

// Asset and Component Imports

import { Bell, CircleUserRound, LogOut } from "lucide-react";
import { AvatarImage, Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import useAuth from "../hooks/use-auth";
import {DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

function TopNav({ Trigger }: { Trigger: any }) {
  return (
    <header className="w-full h-[var(--header-height)] border-b-1 rounded-tr-lg rounded-tl-lg sticky top-0 z-40 bg-white/60 backdrop-blur-lg">
      {/* Header flex container */}
      <div className="w-full h-full px-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex justify-between ">
          <div className="">
            <Trigger />
          </div>
        </div>

        {/* Right */}
        <div className="flex gap-4 items-center">
          <Badge className="py-1 px-3 space-x-1 rounded-full bg-(--positive-background) text-(--positive-foreground) border-(--positive-border) flex items-center pointer-events-none">
            <span>•</span>
            <span>Checked-In</span>
          </Badge>
          <Bell className="" size={16} />

          <div className="w-[1px] h-4 bg-(--color-gray-primary)"></div>

          <AvatarIcon />
        </div>
      </div>
    </header>
  );
}

function AvatarIcon() {

  const {logout} = useAuth()
  return (
    <>


    <DropdownMenu >

      <DropdownMenuTrigger asChild>

      <Avatar>
        <AvatarImage src="./assets/components/avatar.png" alt="User Avatar" />
        <AvatarFallback>HN</AvatarFallback>
      </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="text-(--text-primary) rounded-md" align="end">
        <DropdownMenuGroup>
          
          <DropdownMenuItem>
            <CircleUserRound/> My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut/> Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    
    </DropdownMenu>
    </>
  );
}



export default TopNav;
