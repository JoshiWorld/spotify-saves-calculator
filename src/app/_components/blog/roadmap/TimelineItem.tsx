"use client";

import StatusBadge from "./StatusBadge";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useState } from "react";
import RoadmapItemDetails from "./RoadmapItemDetails";
import { Button } from "@/components/ui/button";
import { type RoadmapItem } from "./roadmap";

interface TimelineItemProps {
  item: RoadmapItem;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, isLast }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mb-6 ml-6">
      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-400 dark:border-gray-900 dark:bg-gray-700"></div>{" "}
      {/* Kreis */}
      {!isLast && (
        <div className="absolute left-0 top-3.5 -ml-0.5 h-full w-0.5 bg-gray-300 dark:bg-gray-700"></div>
      )}{" "}
      {/* Vertikale Linie (außer beim letzten Eintrag) */}
      <Card className="w-full">
        <CardContent>
          <div className="mb-2 flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              {item.title}
            </CardTitle>
            <StatusBadge status={item.status} />
          </div>
          <CardDescription>
            {item.description.substring(0, 100)}...
          </CardDescription>
          <div className="mt-2">
            <Button size="sm" onClick={() => setOpen(true)}>
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
      <RoadmapItemDetails open={open} setOpen={setOpen} item={item} />
    </div>
  );
};

export default TimelineItem;
