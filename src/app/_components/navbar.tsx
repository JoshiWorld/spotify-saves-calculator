"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { UserDropdown } from "@/components/user-dropdown";

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
            Smart<span className="text-primary">Savvy</span>
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
            href="/app"
            className={`font-semibold ${path === "/app" || path.startsWith("/app/project") ? "border-b-2 border-primary" : ""}`}
          >
            Projekte
          </Link>
          <Link
            href="/app/links"
            className={`font-semibold ${path === "/app/links" || path.startsWith("/app/links") ? "border-b-2 border-primary" : ""}`}
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
            href="/app"
            className={`font-semibold ${path === "/app" || path.startsWith("/app/project") ? "border-b-2 border-primary" : ""}`}
          >
            Projekte
          </Link>
          <Link
            href="/app/links"
            className={`font-semibold ${path === "/app/links" || path.startsWith("/app/links") ? "border-b-2 border-primary" : ""}`}
          >
            Links
          </Link>
          <UserDropdown user={user} />
          <ToggleTheme />
        </div>
      )}
    </div>
  );
}
