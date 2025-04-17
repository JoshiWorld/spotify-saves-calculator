"use client";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LoadingSkeleton } from "@/components/ui/loading";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { Home, Plus, Minus, Section, Video } from "lucide-react";
import Link from "next/link";

export function CourseSidebar({ id }: { id: string }) {
  const { data: course, isLoading } = api.course.getCourse.useQuery({ id });

  if(!course || isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Sidebar variant="floating" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sektionen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/app/courses/${id}`}>
                  <SidebarMenuButton>
                    <Home />
                    <span>Übersicht</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              {course.sections.map((section) => (
                <Collapsible
                  defaultOpen
                  className="group/collapsible"
                  key={section.id}
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={
                          section.videos.every((video) => video.usersWatched.length > 0) ? "text-green-500" : ""
                        }
                      >
                        <Section />
                        <span className="font-bold">{section.title}</span>
                        <Plus className="ml-auto group-data-[state=open]/collapsible:hidden" />
                        <Minus className="ml-auto group-data-[state=closed]/collapsible:hidden" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.videos.map((video) => (
                          <SidebarMenuSubItem key={video.id}>
                            <SidebarMenuSubButton
                              asChild
                              className={
                                video.usersWatched.length > 0
                                  ? "text-green-500"
                                  : ""
                              }
                            >
                              <Link
                                href={`/app/courses/${id}?videoId=${video.id}&sectionId=${section.id}`}
                              >
                                <Video
                                  color={
                                    video.usersWatched.length > 0
                                      ? "green"
                                      : "white"
                                  }
                                />
                                <span>{video.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                    {/* <SidebarMenuButton asChild>
                      <a href={`/app/courses/${id}/section/${section.id}`}>
                        <Section />
                        <span>{section.title}</span>
                      </a>
                    </SidebarMenuButton> */}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
