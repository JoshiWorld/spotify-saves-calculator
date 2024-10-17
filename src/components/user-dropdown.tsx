"use client";

import { LogOut, Settings } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "./ui/badge";
import { type User } from "@prisma/client";

export function UserDropdown({ user }: { user: User | null | undefined }) {
  const path = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* <h1 className="mr-4 cursor-pointer font-semibold">{username}</h1> */}
        <Avatar
          className={`cursor-pointer ${path === "/settings" ? "border-2 border-primary" : ""}`}
        >
          {/* @ts-expect-error || @ts-ignore */}
          <AvatarImage src={user?.image} />
          <AvatarFallback>PB</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          {user?.name}{" "}
          {user?.premium && <Badge variant={"gold"}>Premium</Badge>}
          {user?.admin && <Badge variant={"destructive"}>Admin</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <Link href="/settings">Einstellungen</Link>
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <Link href="/api/auth/signout">Log out</Link>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
