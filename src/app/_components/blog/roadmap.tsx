"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoadmapTimeline } from "./roadmap/Timeline";
import { type RoadmapStatus, type RoadmapItem } from "@prisma/client";
import { api } from "@/trpc/react";
import { LoadingSkeleton } from "@/components/ui/loading";

type MinRoadmapItem = {
  description: string;
  id: string;
  title: string;
  status: RoadmapStatus;
  category: string;
  targetDate: Date;
}

export const RoadmapPage: React.FC = () => {
  const {
    data: roadmapItems,
    isLoading,
  } = api.roadmap.getAll.useQuery();
  const [filteredItems, setFilteredItems] = useState<MinRoadmapItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    RoadmapItem["status"] | "All"
  >("All");

  useEffect(() => {
    if (roadmapItems) {
      let filtered = [...roadmapItems];

      if (searchTerm) {
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (selectedStatus !== "All") {
        filtered = filtered.filter((item) => item.status === selectedStatus);
      }

      setFilteredItems(filtered);
    }
  }, [roadmapItems, searchTerm, selectedStatus]);

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-5 text-3xl font-bold">Roadmap</h1>

      <div className="mb-4 flex items-center space-x-4">
        <div>
          <Label htmlFor="search">Search:</Label>
          <Input
            type="text"
            id="search"
            placeholder="Features suchen.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label>Status:</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as RoadmapItem["status"] | "All")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Alle</SelectItem>
              <SelectItem value="Planned">Geplant</SelectItem>
              <SelectItem value="In Progress">In Bearbeitung</SelectItem>
              <SelectItem value="Completed">Fertig</SelectItem>
              <SelectItem value="Rejected">Archiviert</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <RoadmapTimeline items={filteredItems} />
    </div>
  );
};
