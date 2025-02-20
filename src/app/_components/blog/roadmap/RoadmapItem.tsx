"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { type RoadmapItem as RoadmapItemType } from "./roadmap";
import RoadmapItemDetails from "./RoadmapItemDetails";

interface RoadmapItemProps {
  item: RoadmapItemType;
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ item }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            {item.description.substring(0, 100)}...
          </CardDescription>
          <div className="mt-2 flex items-center justify-between">
            <StatusBadge status={item.status} />
            <Button size="sm" onClick={() => setOpen(true)}>
              Details
            </Button>
          </div>
        </CardContent>
      </Card>
      <RoadmapItemDetails open={open} setOpen={setOpen} item={item} />
    </>
  );
};

export default RoadmapItem;
