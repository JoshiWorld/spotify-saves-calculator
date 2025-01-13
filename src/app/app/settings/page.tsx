import { UserSettings } from "@/app/_components/app/user-settings";

export default async function Page() {
  return (
    <div className="container z-20 my-20 flex max-w-xl flex-col items-center justify-center rounded-sm border border-white border-opacity-40 bg-zinc-950 bg-opacity-95 p-5 shadow-xl">
      <UserSettings />
    </div>
  );
}
