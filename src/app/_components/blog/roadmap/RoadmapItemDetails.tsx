"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatusBadge from "./StatusBadge";
import { type RoadmapStatus } from "@prisma/client";

type MinRoadmapItem = {
  description: string;
  id: string;
  title: string;
  status: RoadmapStatus;
  category: string;
  targetDate: Date;
};

interface RoadmapItemDetailsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  item: MinRoadmapItem;
}

const RoadmapItemDetails: React.FC<RoadmapItemDetailsProps> = ({
  open,
  setOpen,
  item,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>
            <StatusBadge status={item.status} />
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="col-span-4">
            <p>{item.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoadmapItemDetails;