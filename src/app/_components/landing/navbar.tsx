"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { Button } from "./button";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";
import { useCalEmbed } from "@/hooks/useCalEmbed";
import { CONSTANTS } from "@/constants/links";
import { api } from "@/trpc/react";
import { type User } from "@prisma/client";

interface NavbarProps {
  navItems: {
    name: string;
    link: string;
  }[];
  visible: boolean;
}

interface NavbarPropsLoggedIn {
  navItems: {
    name: string;
    link: string;
  }[];
  visible: boolean;
  user: User;
}

export const Navbar = () => {
  const navItems = [
    {
      name: "Features",
      link: "/#features",
    },
    {
      name: "Preise",
      link: "/#pricing",
    },
    {
      name: "Kontakt",
      link: "/#contact",
    },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div ref={ref} className="w-full fixed top-0 inset-x-0 z-50">
      <DesktopNav visible={visible} navItems={navItems} />
      <MobileNav visible={visible} navItems={navItems} />
    </motion.div>
  );
};

export function NavbarLoggedIn() {
  const [user] = api.user.get.useSuspenseQuery();

  const navItems = [
    {
      name: "Start",
      link: "/app",
    },
    {
      name: "Projekte",
      link: "/app/projects",
    },
    {
      name: "Links",
      link: "/app/links",
    },
    {
      name: "Forum",
      link: "/app/forum",
    },
    {
      name: "Abo",
      link: "/app/abo",
    },
  ];

  if(user?.admin) {
    navItems.push({
      name: "Admin",
      link: "/app/admin",
    });
  }

  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div ref={ref} className="fixed inset-x-0 top-0 z-50 w-full">
      <DesktopNavLoggedIn visible={visible} navItems={navItems} user={user!} />
      <MobileNavLoggedIn visible={visible} navItems={navItems} />
    </motion.div>
  );
};

const DesktopNav = ({ navItems, visible }: NavbarProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const calOptions = useCalEmbed({
    namespace: CONSTANTS.CALCOM_NAMESPACE,
    styles: {
      branding: {
        brandColor: CONSTANTS.CALCOM_BRAND_COLOR,
      },
    },
    hideEventTypeDetails: CONSTANTS.CALCOM_HIDE_EVENT_TYPE_DETAILS,
    layout: CONSTANTS.CALCOM_LAYOUT,
  });

  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
      }}
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "hidden lg:flex flex-row  self-start bg-transparent dark:bg-transparent items-center justify-between py-2 max-w-7xl mx-auto px-4 rounded-full relative z-[60] w-full",
        visible && "bg-white/80 dark:bg-neutral-950/80"
      )}
    >
      <Logo />
      <motion.div className="lg:flex flex-row flex-1 absolute inset-0 hidden items-center justify-center space-x-2 lg:space-x-2 text-sm text-zinc-600 font-medium hover:text-zinc-800 transition duration-200">
        {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navItems.map((navItem: any, idx: number) => (
          <Link
            onMouseEnter={() => setHovered(idx)}
            className="text-neutral-600 dark:text-neutral-300 relative px-4 py-2"
            key={`link=${idx}`}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            href={navItem.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="w-full h-full absolute inset-0 bg-gray-100 dark:bg-neutral-800 rounded-full"
              />
            )}
            <span className="relative z-20">{
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            navItem.name
            }</span>
          </Link>
        ))}
      </motion.div>
      <div className="flex items-center gap-4">
        <ModeToggle />

        <AnimatePresence mode="popLayout" initial={false}>
          {!visible && (
            <motion.div
              initial={{
                x: 100,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: [0, 0, 1],
              }}
              exit={{
                x: 100,
                opacity: [0, 0, 0],
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <Button
                as={Link}
                href={CONSTANTS.LOGIN_LINK}
                variant="secondary"
                className="hidden md:block "
              >
                Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          data-cal-namespace={calOptions.namespace}
          data-cal-link={CONSTANTS.CALCOM_LINK}
          data-cal-config={`{"layout":"${calOptions.layout}"}`}
          as="button"
          variant="primary"
          className="hidden md:block "
        >
          Beratung
        </Button>
      </div>
    </motion.div>
  );
};

const DesktopNavLoggedIn = ({ navItems, visible, user }: NavbarPropsLoggedIn) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
      }}
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 50,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 dark:bg-transparent lg:flex",
        visible && "bg-white/80 dark:bg-neutral-950/80",
      )}
    >
      <Logo />
      <motion.div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          navItems.map((navItem: any, idx: number) => (
            <Link
              onMouseEnter={() => setHovered(idx)}
              className="relative px-4 py-2 text-neutral-600 dark:text-neutral-300"
              key={`link=${idx}`}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
              href={navItem.link}
            >
              {hovered === idx && (
                <motion.div
                  layoutId="hovered"
                  className="absolute inset-0 h-full w-full rounded-full bg-gray-100 dark:bg-neutral-800"
                />
              )}
              <span className="relative z-20">
                {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  navItem.name
                }
              </span>
            </Link>
          ))
        }
      </motion.div>
      <div className="flex items-center gap-4">
        <ModeToggle />

        <AnimatePresence mode="popLayout" initial={false}>
          {!visible && (
            <motion.div
              initial={{
                x: 100,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: [0, 0, 1],
              }}
              exit={{
                x: 100,
                opacity: [0, 0, 0],
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              <Button
                as={Link}
                href="/app/settings"
                variant="secondary"
                className="hidden md:block"
              >
                {user.name ?? "User"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          as="button"
          variant={user.admin ? "admin" : user.package ? "package" : "primary"}
          className="hidden md:block"
        >
          {user.admin
            ? "Admin"
            : user.package
              ? user.package.charAt(0).toUpperCase() +
                user.package.slice(1).toLowerCase()
              : "Free"}
        </Button>
      </div>
    </motion.div>
  );
};

const MobileNav = ({ navItems, visible }: NavbarProps) => {
  const [open, setOpen] = useState(false);

  const calOptions = useCalEmbed({
    namespace: CONSTANTS.CALCOM_NAMESPACE,
    styles: {
      branding: {
        brandColor: "#000000",
      },
    },
    hideEventTypeDetails: false,
    layout: "month_view",
  });

  return (
    <>
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          width: visible ? "90%" : "100%",
          y: visible ? 20 : 0,
          borderRadius: open ? "4px" : "2rem",
          paddingRight: visible ? "12px" : "0px",
          paddingLeft: visible ? "12px" : "0px",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
          visible && "bg-white/80 dark:bg-neutral-950/80",
        )}
      >
        <div className="flex w-full flex-row items-center justify-between">
          <Logo />
          {open ? (
            <IconX
              className="text-black dark:text-white"
              onClick={() => setOpen(!open)}
            />
          ) : (
            <IconMenu2
              className="text-black dark:text-white"
              onClick={() => setOpen(!open)}
            />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950"
            >
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                navItems.map((navItem: any, idx: number) => (
                  <Link
                    key={`link=${idx}`}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={navItem.link}
                    onClick={() => setOpen(false)}
                    className="relative text-neutral-600 dark:text-neutral-300"
                  >
                    <motion.span className="block">
                      {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        navItem.name
                      }{" "}
                    </motion.span>
                  </Link>
                ))
              }
              <Button
                as={Link}
                onClick={() => setOpen(false)}
                href={CONSTANTS.LOGIN_LINK}
                variant="primary"
                className="block w-full md:hidden"
              >
                Login
              </Button>
              <Button
                data-cal-namespace={calOptions.namespace}
                data-cal-link={CONSTANTS.CALCOM_LINK}
                data-cal-config={`{"layout":"${calOptions.layout}"}`}
                as="button"
                onClick={() => setOpen(false)}
                variant="primary"
                className="block w-full md:hidden"
              >
                Beratung
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const MobileNavLoggedIn = ({ navItems, visible }: NavbarProps) => {
  const [open, setOpen] = useState(false);

  const calOptions = useCalEmbed({
    namespace: CONSTANTS.CALCOM_NAMESPACE,
    styles: {
      branding: {
        brandColor: "#000000",
      },
    },
    hideEventTypeDetails: false,
    layout: "month_view",
  });

  return (
    <>
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          width: visible ? "90%" : "100%",
          y: visible ? 20 : 0,
          borderRadius: open ? "4px" : "2rem",
          paddingRight: visible ? "12px" : "0px",
          paddingLeft: visible ? "12px" : "0px",
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
          visible && "bg-white/80 dark:bg-neutral-950/80",
        )}
      >
        <div className="flex w-full flex-row items-center justify-between">
          <Logo />
          {open ? (
            <IconX
              className="text-black dark:text-white"
              onClick={() => setOpen(!open)}
            />
          ) : (
            <IconMenu2
              className="text-black dark:text-white"
              onClick={() => setOpen(!open)}
            />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] dark:bg-neutral-950"
            >
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                navItems.map((navItem: any, idx: number) => (
                  <Link
                    key={`link=${idx}`}
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    href={navItem.link}
                    onClick={() => setOpen(false)}
                    className="relative text-neutral-600 dark:text-neutral-300"
                  >
                    <motion.span className="block">
                      {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        navItem.name
                      }{" "}
                    </motion.span>
                  </Link>
                ))
              }
              <Button
                as={Link}
                onClick={() => setOpen(false)}
                href={CONSTANTS.LOGIN_LINK}
                variant="primary"
                className="block w-full md:hidden"
              >
                Login
              </Button>
              <Button
                data-cal-namespace={calOptions.namespace}
                data-cal-link={CONSTANTS.CALCOM_LINK}
                data-cal-config={`{"layout":"${calOptions.layout}"}`}
                as="button"
                onClick={() => setOpen(false)}
                variant="primary"
                className="block w-full md:hidden"
              >
                Beratung
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};