"use client";

import RoadmapItem from "./RoadmapItem";
import { type RoadmapItem as RoadmapItemType } from "./roadmap";

interface RoadmapListProps {
  items: RoadmapItemType[];
}

const RoadmapList: React.FC<RoadmapListProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <RoadmapItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default RoadmapList;
