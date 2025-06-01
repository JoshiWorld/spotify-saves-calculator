import { Projects } from "@/app/_components/app/projects";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Playlist-Analyse | SmartSavvy",
  description: "SmartSavvy Playlist Analyzer",
};

export default async function Home() {
  return <Projects />;
}
