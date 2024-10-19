"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { UserDropdown } from "@/components/user-dropdown";

export function Navbar() {
  return (
    <div className="flex items-center justify-center border-b-2 bg-background">
      <div className="m-2 flex-none px-4 py-2 text-center">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Finance<span className="text-primary">Viewer</span>
        </h3>
      </div>
      <div className="m-2 flex-grow px-4 py-2 text-center"></div>
      <div className="m-2 flex flex-none items-center justify-between px-4 py-2 text-center">
        <Link href="api/auth/signin" className="mr-4 font-semibold">
          Login
        </Link>
        <ToggleTheme />
      </div>
    </div>
  );
}

export function NavbarLoggedIn() {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();

  const { data: user, isLoading } = api.user.get.useQuery();

  if (isLoading) return <p>Loading..</p>;

  return (
    <div className="border-b-2 bg-background">
      <div className="flex items-center justify-between p-4">
        <div className="flex-none">
          <h3 className="text-2xl font-semibold tracking-tight">
            S<span className="text-primary">S</span>C
          </h3>
        </div>
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
        <div className="hidden flex-grow justify-center md:flex md:items-center md:space-x-4">
          <Link
            href="/"
            className={`font-semibold ${path === "/" || path.startsWith("/project") ? "border-b-2 border-primary" : ""}`}
          >
            Projekte
          </Link>
          <Link
            href="/links"
            className={`font-semibold ${path === "/links" || path.startsWith("/links") ? "border-b-2 border-primary" : ""}`}
          >
            Links
          </Link>
        </div>
        <div className="hidden md:flex md:items-center md:space-x-4">
          <UserDropdown user={user} />
          <ToggleTheme />
        </div>
      </div>
      {isOpen && (
        <div className="flex flex-col items-center space-y-4 md:hidden">
          <Link
            href="/"
            className={`font-semibold ${path === "/" ? "border-b-2 border-primary" : ""}`}
          >
            Übersicht
          </Link>
          <Link
            href="/ausgaben"
            className={`font-semibold ${path === "/ausgaben" ? "border-b-2 border-primary" : ""}`}
          >
            Ausgaben
          </Link>
          <Link
            href="/tags"
            className={`font-semibold ${path === "/tags" ? "border-b-2 border-primary" : ""}`}
          >
            Tags
          </Link>
          <UserDropdown user={user} />
          <ToggleTheme />
        </div>
      )}
    </div>
  );
}
