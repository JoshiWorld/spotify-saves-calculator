"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api } from "@/trpc/react";
import { type Campaign, type Project } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function TopNavigator() {
  const pathname = usePathname();
  const projectId = pathname.split("/")[3] ?? "";
  const campaignId = pathname.split("/")[5] ?? "";
  const [project, setProject] = useState<Project | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  const projectQuery = api.project.get.useQuery(
    { id: projectId },
    { enabled: !!projectId },
  );
  const campaignQuery = api.campaign.get.useQuery(
    { id: campaignId },
    { enabled: !!campaignId },
  );

  useEffect(() => {
    if (projectId && projectQuery.status === "success") {
      setProject(projectQuery.data);
    }

    if (campaignId && campaignQuery.status === "success") {
      setCampaign(campaignQuery.data);
    }
  }, [
    projectId,
    campaignId,
    projectQuery.status,
    projectQuery.data,
    campaignQuery.status,
    campaignQuery.data,
  ]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/app">Projekte</BreadcrumbLink>
        </BreadcrumbItem>
        {project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/app/project/${project?.id}`}>
                Projekt: {project?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        {campaign && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/app/project/${project?.id}/campaign/${campaign?.id}`}
              >
                Kampagne: {campaign?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
