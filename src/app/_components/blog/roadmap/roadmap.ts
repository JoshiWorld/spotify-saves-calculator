export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "Planned" | "In Progress" | "Completed" | "Rejected";
  category: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
  targetDate?: Date;
}