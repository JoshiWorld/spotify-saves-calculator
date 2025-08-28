import { GridLineVertical } from "@/components/ui/background-grids";
import { Kontakt } from "../_components/kontakt";
import { Footer } from "../_components/landing/footer";
import { Navbar } from "../_components/landing/navbar";

export default function KontaktPage() {
    return (
      <main>
        <Navbar />
        <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
          <BackgroundGrids />
          <Kontakt />
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
      <div className="relative h-full w-full bg-linear-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
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