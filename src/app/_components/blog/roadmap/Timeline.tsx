"use client";

import { type RoadmapItem } from "./roadmap";
import TimelineItem from "./TimelineItem";

interface TimelineProps {
  items: RoadmapItem[];
}

export const RoadmapTimeline: React.FC<TimelineProps> = ({ items }) => {
  // Gruppiere die Items nach Jahr und Monat (oder Quartal, je nach Bedarf)
  const groupedItems = items.reduce((acc: any, item) => {
    const date = item.targetDate
      ? new Date(item.targetDate)
      : new Date(item.createdAt); // Fallback auf createdAt, falls targetDate fehlt
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" }); // Monatsname

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
      {Object.entries(groupedItems).map(
        ([year, months]: [string, any], yearIndex) => (
          <div key={year}>
            <h2 className="mb-4 mt-8 text-2xl font-bold">{year}</h2>
            {Object.entries(months).map(
              ([month, items]: [string, any], monthIndex) => (
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
              ),
            )}
          </div>
        ),
      )}
    </div>
  );
};
