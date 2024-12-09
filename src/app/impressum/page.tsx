import { GridLineVertical } from "@/components/ui/background-grids";
import { Navbar } from "@/app/_components/landing/navbar";

export default function Impressum() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
      <BackgroundGrids />
      <Navbar />

      <div className="container z-20 flex w-full flex-col items-center justify-center">
        <div className="container z-20 my-20 flex flex-col items-start justify-center rounded-sm border border-white border-opacity-40 bg-neutral-200 dark:bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Impressum
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Joshua Stieber</p>
          <p className="leading-7">Auf der Geest 4</p>
          <p className="leading-7">30826 Garbsen</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Steuernummer: <span className="font-medium">27/143/12890</span>
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Telefon: +49 151 62368185
          </p>
          <p className="leading-7">
            E-Mail: <a href="mailto:support@smartsavvy.eu" className="hover:underline">support@smartsavvy.eu</a>
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Verantwortlich nach § 55 Abs. 2 RStV:
          </p>
          <p className="leading-7">Joshua Stieber</p>

          <div className="my-5 flex w-full items-center justify-center gap-5">
            <a
              href="/impressum"
              className="text-sm text-muted-foreground hover:underline"
            >
              Impressum
            </a>
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Datenschutz
            </a>
          </div>
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
