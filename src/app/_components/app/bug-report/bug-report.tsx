"use client";

import { cn } from "@/lib/utils";
import { type LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX, IconArrowNarrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BugType } from "@prisma/client";
import { CreateBug } from "./bug";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const views = [
  {
    id: "bugs",
    name: "Bugs",
    description: "Report bugs and issues",
  },
  {
    id: "features",
    name: "Features",
    description: "Request new features",
  },
];

export function BugReportSidebar() {
  return (
    <SidebarLayout>
      <Dashboard />
    </SidebarLayout>
  );
}

export function SidebarLayout({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");

  if (!view) {
    router.push(`/app/bug-report?view=bugs`);
  }

  const [open, setOpen] = useState(true);
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden md:flex-row",
        "h-screen",
        className,
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col">
              {views.map((view) => (
                <SidebarLink key={view.id} view={view} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

const Dashboard = () => {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "";
  // const review = searchParams.get("review") ?? "";

  const { data, isLoading, isError } = api.bug.getAll.useQuery();

  return (
    <div className="m-2 flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900 md:p-10">
        {isLoading || isError ? (
          <>
            <div className="flex gap-2">
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [...new Array(4)].map((_, i) => (
                  <div
                    key={"first-array" + i}
                    className="h-20 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
                  ></div>
                ))
              }
            </div>
            <div className="flex flex-1 gap-2">
              {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [...new Array(2)].map((_, i) => (
                  <div
                    key={"second-array" + i}
                    className="h-full w-full animate-pulse rounded-lg bg-gray-100 dark:bg-neutral-800"
                  ></div>
                ))
              }
            </div>
          </>
        ) : (
          <>
            {view === "bugs" ? (
              <>
                <CreateBug type={BugType.BUG} />
                {data!
                  .filter((bug) => bug.type === BugType.BUG)
                  .map((bug) => (
                    <Card
                      key={bug.id}
                      className="my-1 w-full cursor-pointer bg-gray-200 hover:bg-opacity-60 dark:bg-neutral-950 dark:hover:bg-opacity-60"
                      // onClick={() => setThread(thread.id)}
                    >
                      <CardHeader className="flex flex-col">
                        <div className="flex justify-between">
                          <CardTitle>{bug.message}</CardTitle>
                          {bug.resolved ? (
                            <Badge
                              variant={"success"}
                              className="flex max-h-6 items-center whitespace-nowrap"
                            >
                              Behoben
                            </Badge>
                          ) : (
                            <Badge
                              variant={"secondary"}
                              className="flex max-h-6 items-center whitespace-nowrap"
                            >
                              Offen
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <CardDescription>
                            Erstellt am {bug.createdAt.toLocaleString()}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground">{`Zuletzt aktualisiert: ${bug.updatedAt.toLocaleString()}`}</p>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </>
            ) : (
              <>
                <CreateBug type={BugType.IMPROVEMENT} />
                {data!
                  .filter((feature) => feature.type === BugType.IMPROVEMENT)
                  .map((feature) => (
                    <Card
                      key={feature.id}
                      className="my-1 w-full cursor-pointer bg-gray-200 hover:bg-opacity-60 dark:bg-neutral-950 dark:hover:bg-opacity-60"
                      // onClick={() => setThread(thread.id)}
                    >
                      <CardHeader className="flex flex-col">
                        <div className="flex justify-between">
                          <CardTitle>{feature.message}</CardTitle>
                          {feature.resolved ? (
                            <Badge
                              variant={"success"}
                              className="flex max-h-6 items-center whitespace-nowrap"
                            >
                              Hinzugefügt
                            </Badge>
                          ) : (
                            <Badge
                              variant={"secondary"}
                              className="flex max-h-6 items-center whitespace-nowrap"
                            >
                              Offen
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between">
                          <CardDescription>
                            Erstellt am {feature.createdAt.toLocaleString()}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground">{`Zuletzt aktualisiert: ${feature.updatedAt.toLocaleString()}`}</p>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface Links {
  id: string;
  description: string | null;
  name: string;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp ?? openState;
  const setOpen = setOpenProp ?? setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen } = useSidebar();
  return (
    <motion.div
      className={cn(
        "group/sidebar-btn relative m-2 hidden h-full w-[300px] flex-shrink-0 rounded-xl bg-white px-4 py-4 dark:bg-neutral-900 md:flex md:flex-col",
        className,
      )}
      animate={{
        width: open ? "300px" : "70px",
      }}
      {...props}
    >
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "absolute -right-2 top-4 z-40 hidden h-5 w-5 transform items-center justify-center rounded-sm border border-neutral-200 bg-white transition duration-200 group-hover/sidebar-btn:flex dark:border-neutral-700 dark:bg-neutral-900",
          open ? "rotate-0" : "rotate-180",
        )}
      >
        <IconArrowNarrowLeft className="text-black dark:text-white" />
      </button>
      {children as React.ReactNode}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen } = useSidebar();
  return (
    <motion.div
      className={cn(
        "flex h-10 w-full flex-row items-center justify-between bg-neutral-100 px-4 py-4 dark:bg-neutral-800 md:hidden",
      )}
      {...props}
    >
      <div className="z-20 flex w-full justify-end">
        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200"
          onClick={() => setOpen(!open)}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className={cn(
              "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-neutral-900",
              className,
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children as React.ReactNode}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const SidebarLink = ({
  view,
  className,
  ...props
}: {
  view: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsView = searchParams.get("view");
  const { open } = useSidebar();

  const setCategory = (id: string) => {
    router.push(`?view=${id}`);
  };

  return (
    <Button
      variant="ghost"
      onClick={() => setCategory(view.id)}
      className={cn(
        "group/sidebar flex items-center justify-start gap-2 rounded-sm px-2 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700",
        paramsView === view.id ? "border-l-4 border-primary" : "",
        className,
      )}
      {...props}
    >
      {/* {link.icon} */}

      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="!m-0 inline-block whitespace-pre !p-0 text-sm text-neutral-700 transition duration-150 dark:text-neutral-200"
      >
        {view.name}
      </motion.span>
    </Button>
  );
};
