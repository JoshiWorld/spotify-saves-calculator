"use client";

import { api } from "@/trpc/react";

export function Stats() {
  const [visits] = api.linkstats.getVisits.useSuspenseQuery();
  const [clicks] = api.linkstats.getClicks.useSuspenseQuery();

  const visitsDifference = visits.totalActions - visits.totalActionsBefore;
  const clicksDifference = clicks.totalActions - clicks.totalActionsBefore;

  const betterVisits = visitsDifference > 0;
  const betterClicks = clicksDifference > 0;

  return (
    <div className="flex w-full items-center justify-around py-10">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
          Aufrufe
        </h2>
        <p>{visits.totalActions}</p>
        <p
          className={`pt-6 text-xs italic ${betterVisits ? "text-green-500" : "text-red-500"}`}
        >
          {betterVisits ? `+${visitsDifference}` : visitsDifference} zur letzten
          Woche
        </p>
      </div>
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
          Klicks
        </h2>
        <p>{clicks.totalActions}</p>
        <p
          className={`pt-6 text-xs italic ${betterClicks ? "text-green-500" : "text-red-500"}`}
        >
          {betterClicks ? `+${clicksDifference}` : clicksDifference} zur letzten
          Woche
        </p>
      </div>
    </div>
  );
}
