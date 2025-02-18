import Link from "next/link";
import React from "react";
import { Logo } from "./logo";

export function Footer() {
  const pages = [
    {
      title: "Start",
      href: "#",
    },
    {
      title: "Features",
      href: "#features",
    },
    {
      title: "Preise",
      href: "#pricing",
    },
    {
      title: "FAQs",
      href: "#faq",
    },
    // {
    //   title: "Blog",
    //   href: "#",
    // },
  ];

  const socials = [
    // {
    //   title: "Facebook",
    //   href: "#",
    // },
    {
      title: "Instagram",
      href: "https://instagram.com/smartsavvy.eu",
    },
    {
      title: "YouTube",
      href: "https://www.youtube.com/@smartsavvyeu",
    },
    // {
    //   title: "LinkedIn",
    //   href: "#",
    // },
  ];
  const legals = [
    {
      title: "Datenschutz",
      href: "/privacy",
    },
    {
      title: "AGB",
      href: "/usage",
    },
    {
      title: "Impressum",
      href: "/impressum",
    },
  ];

  const signups = [
    // {
    //   title: "Registrieren",
    //   href: "#",
    // },
    {
      title: "Anmelden",
      href: "/login",
    },
    // {
    //   title: "Book a demo",
    //   href: "#",
    // },
  ];
  return (
    <div className="border-t border-neutral-100 dark:border-white/[0.1] px-8 py-20 bg-white dark:bg-neutral-950 w-full relative overflow-hidden">
      <div className="max-w-7xl mx-auto text-sm text-neutral-500 flex sm:flex-row flex-col justify-between items-start  md:px-8">
        <div>
          <div className="mr-0 md:mr-4  md:flex mb-4">
            <Logo />
          </div>

          <div className="mt-2 ml-2">
            &copy; Copyright SmartSavvy 2024. All rights reserved.
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 items-start mt-10 sm:mt-0 md:mt-0">
          <div className="flex justify-center space-y-4 flex-col w-full">
            <p className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
              Seiten
            </p>
            <ul className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 list-none space-y-4">
              {pages.map((page, idx) => (
                <li key={"pages" + idx} className="list-none">
                  <Link
                    className="transition-colors hover:text-text-neutral-800 "
                    href={page.href}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center space-y-4 flex-col">
            <p className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
              Socials
            </p>
            <ul className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 list-none space-y-4">
              {socials.map((social, idx) => (
                <li key={"social" + idx} className="list-none">
                  <Link
                    className="transition-colors hover:text-text-neutral-800 "
                    href={social.href} target="blank"
                  >
                    {social.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center space-y-4 flex-col">
            <p className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
              Rechtliches
            </p>
            <ul className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 list-none space-y-4">
              {legals.map((legal, idx) => (
                <li key={"legal" + idx} className="list-none">
                  <Link
                    className="transition-colors hover:text-text-neutral-800 "
                    href={legal.href}
                  >
                    {legal.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center space-y-4 flex-col">
            <p className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold">
              Dashboard
            </p>
            <ul className="transition-colors hover:text-text-neutral-800 text-neutral-600 dark:text-neutral-300 list-none space-y-4">
              {signups.map((auth, idx) => (
                <li key={"auth" + idx} className="list-none">
                  <Link
                    className="transition-colors hover:text-text-neutral-800 "
                    href={auth.href}
                  >
                    {auth.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
