"use client"

import * as React from "react"
import {
  IconArticle,
  IconBrandSpotify,
  IconBuildingCommunity,
  IconCalculator,
  IconChartBar,
  IconChecklist,
  IconDashboard,
  IconDatabase,
  IconFolder,
  IconHelp,
  IconLink,
  IconListDetails,
  IconMusic,
  IconPackage,
  IconRoad,
  IconUserBolt,
  IconVideo,
} from "@tabler/icons-react"
import Image from "next/image";
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { api } from "@/trpc/react";
import { LoadingDataSkeleton } from "./ui/loading";
import { NavAdmin } from "./nav-documents";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/app",
      icon: IconDashboard,
    },
    {
      title: "Smartlinks",
      url: "/app/links",
      icon: IconListDetails,
    },
    {
      title: "SavesCalculator",
      url: "/app/projects",
      icon: IconFolder,
    },
    {
      title: "PlaylistAnalyser",
      url: "/app/playlist/analyse",
      icon: IconChartBar,
    },
    {
      title: "Forum",
      url: "/app/forum",
      icon: IconBuildingCommunity,
    },
    {
      title: "Kurse",
      url: "/app/courses",
      icon: IconVideo,
    },
  ],
  // navClouds: [
  //   {
  //     title: "Capture",
  //     icon: IconCamera,
  //     isActive: true,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Proposal",
  //     icon: IconFileDescription,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Prompts",
  //     icon: IconFileAi,
  //     url: "#",
  //     items: [
  //       {
  //         title: "Active Proposals",
  //         url: "#",
  //       },
  //       {
  //         title: "Archived",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  navSecondary: [
    // {
    //   title: "Einstellungen",
    //   url: "/app/settings",
    //   icon: IconSettings,
    // },
    // {
    //   title: "Hilfe",
    //   url: "#",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],
  admin: [
    {
      name: "Dashboard",
      url: "/app/admin",
      icon: IconDashboard,
    },
    {
      name: "Produkte",
      url: "/app/admin/products",
      icon: IconPackage,
    },
    {
      name: "Benutzer",
      url: "/app/admin/users",
      icon: IconUserBolt,
    },
    {
      name: "Forum",
      url: "/app/admin/forum",
      icon: IconBuildingCommunity,
    },
    {
      name: "Spotify",
      url: "/app/admin/spotify",
      icon: IconBrandSpotify,
    },
    {
      name: "Genres",
      url: "/app/admin/genres",
      icon: IconMusic,
    },
    {
      name: "Links",
      url: "/app/admin/links",
      icon: IconLink,
    },
    {
      name: "Roadmap",
      url: "/app/admin/roadmap",
      icon: IconRoad,
    },
    {
      name: "Blogs",
      url: "/app/admin/blogs",
      icon: IconArticle,
    },
    {
      name: "Dokumentation",
      url: "/app/admin/documentation",
      icon: IconChecklist,
    },
    {
      name: "Migration",
      url: "/app/admin/migration",
      icon: IconDatabase,
    },
    {
      name: "Kurse",
      url: "/app/admin/courses",
      icon: IconVideo,
    },
    {
      name: "Rechner",
      url: "/app/admin/calculator",
      icon: IconCalculator,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme } = useTheme();
  const { data: user } = api.user.get.useQuery();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/">
                <Image
                  src={theme === "light" ? "/images/logo-white.png" : "/images/logo.png"}
                  alt="logo"
                  width={30}
                  height={30}
                />
                <span className="text-base font-semibold">SmartSavvy Beta</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {user?.admin && <NavAdmin items={data.admin} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <NavUser user={user} />
        ) : (
          <LoadingDataSkeleton />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
