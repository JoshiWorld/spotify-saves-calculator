import { CreateLinkOverview } from "@/app/_components/app/links/create-link";

export default async function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
          <CreateLinkOverview />
        </div>
      </div>
    </div>
  );
}