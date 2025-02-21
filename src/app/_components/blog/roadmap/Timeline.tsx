"use client";

import { type RoadmapStatus } from "@prisma/client";
import TimelineItem from "./TimelineItem";

interface TimelineProps {
  items: MinRoadmapItem[];
}

type MinRoadmapItem = {
  description: string;
  id: string;
  title: string;
  status: RoadmapStatus;
  category: string;
  targetDate: Date;
}

type GroupedItems = Record<string, Record<string, MinRoadmapItem[]>>;

export const RoadmapTimeline: React.FC<TimelineProps> = ({ items }) => {
  const groupedItems = items.reduce((acc: GroupedItems, item) => {
    const date = new Date(item.targetDate);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    acc[year][month].push(item);
    return acc;
  }, {});

  return (
    <div className="relative">
      {Object.entries(groupedItems).map(([year, months]) => (
        <div key={year}>
          <h2 className="mb-4 mt-8 text-2xl font-bold">{year}</h2>
          {Object.entries(months).map(([month, items]) => (
            <div key={month} className="relative">
              <h3 className="mb-2 ml-6 text-xl font-semibold">{month}</h3>
              <div className="relative ml-6">
                <div className="absolute left-0 top-0 h-full w-1 bg-gray-300"></div>{" "}
                {/* Vertikale Linie */}
                {items.map((item, itemIndex) => (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    isLast={itemIndex === items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
