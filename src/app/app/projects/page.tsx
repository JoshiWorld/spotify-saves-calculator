import { Projects } from "@/app/_components/app/projects";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Spotify Saves Calculator | SmartSavvy",
  description: "Deine Projekte aus dem Spotify Saves Calculator",
};

export default async function Home() {
  return <Projects />;
}
