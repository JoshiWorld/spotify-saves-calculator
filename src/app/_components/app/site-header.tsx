import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { InstagramLogoIcon } from "@radix-ui/react-icons"
import Link from "next/link"

type Steps = {
  text: string;
  url?: string;
}

export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://instagram.com/smartsavvy.eu"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <InstagramLogoIcon />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

export function SiteHeaderLinks({ steps }: { steps: Steps[] }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium flex gap-2">
          {steps.map((step, idx) => (
            <span key={idx} className="flex items-center gap-2">
              {idx === steps.length - 1 ? (
                <span>{step.text}</span>
              ) : (
                <Link className="hover:underline" href={step.url ?? ""}>{step.text}</Link>
              )}
              {idx < steps.length - 1 && <span>-&gt;</span>}
            </span>
          ))}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://instagram.com/smartsavvy.eu"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              <InstagramLogoIcon />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}