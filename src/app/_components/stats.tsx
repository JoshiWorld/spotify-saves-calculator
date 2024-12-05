"use client";

import { api } from "@/trpc/react";

export function Stats() {
  const [stats] = api.linkstats.getAll.useSuspenseQuery();
  const linkViews = stats
    .filter((stat) => stat.event === "ssc-link-visit")
    .reduce((total, stat) => total + stat.actions, 0);
  const linkClicks = stats
    .filter((stat) => stat.event === "ssc-link-click")
    .reduce((total, stat) => total + stat.actions, 0);

  return (
    <div className="w-full flex items-center justify-around py-10">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
          Aufrufe
        </h2>
        <p>{linkViews}</p>
        <p className="pt-6 text-xs italic text-green-500">
          +100 zur letzten Woche
        </p>
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
          Klicks
        </h2>
        <p>{linkClicks}</p>
        <p className="pt-6 text-xs italic text-red-500">
          -100 zur letzten Woche
        </p>
      </div>
    </div>
  );
}
