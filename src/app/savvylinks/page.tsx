import { GridLineVertical } from "@/components/ui/background-grids";
import { Footer } from "../_components/landing/footer";
import { Navbar } from "../_components/landing/navbar";
import { MusicLinkConverter } from "../_components/MusicLinkConverter";

export default function SongLinkPage() {
  return (
    <main>
      <Navbar />
      <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
        <BackgroundGrids />
        <MusicLinkConverter />
      </div>
      <Footer />
    </main>
  );
}

const BackgroundGrids = () => {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 grid h-full w-full -rotate-45 transform select-none grid-cols-2 gap-10 overflow-hidden md:grid-cols-4">
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full bg-gradient-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
    </div>
  );
};
