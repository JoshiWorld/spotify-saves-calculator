import { env } from "@/env";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-4 bg-white shadow dark:bg-background border-t-2">
      <div className="mx-auto w-full max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center">
          © {currentYear}{" "}
          <a
            href={env.NEXTAUTH_URL}
            className="hover:underline"
          >
            Brokoly™
          </a>
          . All Rights Reserved.
        </span>
        <ul className="mt-3 flex flex-wrap items-center text-sm font-medium text-gray-500 sm:mt-0">
          <li>
            <Link href="/security" className="me-4 hover:underline md:me-6">
              Datenschutz
            </Link>
          </li>
          <li>
            <Link href="/impressum" className="me-4 hover:underline md:me-6">
              Impressum
            </Link>
          </li>
          <li>
            <Link href="/usage" className="me-4 hover:underline md:me-6">
              AGB
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Kontakt
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
