import Link from "next/link";

const buttons = [
  {
    link: "/app/projects",
    name: "SavesCalculator",
  },
  {
    link: "/app/links",
    name: "SmartLinks",
  },
  {
    link: "/app/forum",
    name: "Forum",
  },
];

export default async function Home() {
  return (
    <div className="container z-20 mt-20 flex max-w-md flex-col items-center justify-center">
      {buttons.map((button, index) => (
        <Link
          key={index}
          className="my-3 flex w-full justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl transition hover:scale-110 hover:bg-zinc-900"
          href={button.link}
        >
          {button.name}
        </Link>
      ))}
    </div>
  );
}
