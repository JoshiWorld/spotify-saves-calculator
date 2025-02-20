"use client";

import { Badge } from "@/components/ui/badge";
import { type RoadmapItem } from "./roadmap";

interface StatusBadgeProps {
  status: RoadmapItem["status"];
}

const statusColors = {
  Planned: "bg-gray-200 text-gray-700",
  "In Progress": "bg-blue-200 text-blue-700",
  Completed: "bg-green-200 text-green-700",
  Rejected: "bg-red-200 text-red-700",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusColor = statusColors[status] || "bg-gray-100 text-gray-500";

  return <Badge className={statusColor}>{status}</Badge>;
};

export default StatusBadge;
