"use client";

import { Badge } from "@/components/ui/badge";
import { type RoadmapItem } from "@prisma/client";

interface StatusBadgeProps {
  status: RoadmapItem["status"];
}

const statusColors = {
  PLANNED: "bg-gray-200 text-gray-700",
  INPROGRESS: "bg-blue-200 text-blue-700",
  COMPLETED: "bg-green-200 text-green-700",
  REJECTED: "bg-red-200 text-red-700",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColor = statusColors[status] || "bg-gray-100 text-gray-500";

  return <Badge className={statusColor}>{status}</Badge>;
};

export default StatusBadge;
