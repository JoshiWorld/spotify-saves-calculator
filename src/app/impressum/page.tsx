import { GridLineVertical } from "@/components/ui/background-grids";
import { Navbar } from "@/app/_components/landing/navbar";

export default function Impressum() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
      <BackgroundGrids />

      <Navbar />
      <div className="container z-20 mt-20 flex max-w-md flex-col items-center justify-center">
        <div className="container z-20 my-20 flex flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Impressum
          </h1>
          <p className="leading-7">
            Joshua Stieber
          </p>
          <p className="leading-7">
            Auf der Geest 4
          </p>
          <p className="leading-7">
            30826 Garbsen
          </p>
          <p className="leading-7">
            Deutschland
          </p>
          <h2 className="scroll-m-20 border-b text-3xl font-semibold tracking-tight mt-5">
            Kontakt
          </h2>
          <p className="leading-7">
            E-Mail: joshua@smartsavvy.eu
          </p>
        </div>
      </div>
    </div>
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
