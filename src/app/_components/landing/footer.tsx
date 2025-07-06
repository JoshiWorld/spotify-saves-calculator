import Link from "next/link";
import React from "react";
import { Logo } from "./logo";

export function Footer() {
  const pages = [
    {
      title: "Start",
      href: "/#",
    },
    {
      title: "Features",
      href: "/#features",
    },
    {
      title: "Preise",
      href: "/#pricing",
    },
    {
      title: "FAQs",
      href: "/#faq",
    },
    // {
    //   title: "Blog",
    //   href: "#",
    // },
  ];

  const news = [
    {
      title: "Blogs",
      href: "/blog",
    },
    {
      title: "Roadmap",
      href: "/blog#roadmap",
    },
    {
      title: "Stats",
      href: "/blog#stats",
    },
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
    <div className="relative w-full overflow-hidden border-t border-neutral-100 bg-white px-8 py-20 dark:border-white/10 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between text-sm text-neutral-500 sm:flex-row md:px-8">
        <div>
          <div className="mb-4 mr-0 md:mr-4 md:flex">
            <Logo />
          </div>

          <div className="ml-2 mt-2">
            &copy; Copyright SmartSavvy 2025. All rights reserved.
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 items-start gap-10 sm:mt-0 md:mt-0 lg:grid-cols-5">
          <div className="flex w-full flex-col justify-center space-y-4">
            <p className="hover:text-text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Seiten
            </p>
            <ul className="hover:text-text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              {pages.map((page, idx) => (
                <li key={"pages" + idx} className="list-none">
                  <Link
                    className="hover:text-text-neutral-800 transition-colors"
                    href={page.href}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex w-full flex-col justify-center space-y-4">
            <p className="hover:text-text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              News
            </p>
            <ul className="hover:text-text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              {news.map((page, idx) => (
                <li key={"pages" + idx} className="list-none">
                  <Link
                    className="hover:text-text-neutral-800 transition-colors"
                    href={page.href}
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <p className="hover:text-text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Socials
            </p>
            <ul className="hover:text-text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              {socials.map((social, idx) => (
                <li key={"social" + idx} className="list-none">
                  <Link
                    className="hover:text-text-neutral-800 transition-colors"
                    href={social.href}
                    target="blank"
                  >
                    {social.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <p className="hover:text-text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Rechtliches
            </p>
            <ul className="hover:text-text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              {legals.map((legal, idx) => (
                <li key={"legal" + idx} className="list-none">
                  <Link
                    className="hover:text-text-neutral-800 transition-colors"
                    href={legal.href}
                  >
                    {legal.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="hover:text-text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Dashboard
            </p>
            <ul className="hover:text-text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              {signups.map((auth, idx) => (
                <li key={"auth" + idx} className="list-none">
                  <Link
                    className="hover:text-text-neutral-800 transition-colors"
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
