"use client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

export const Logo = () => {
  const { theme } = useTheme();

  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src={theme === "light" ? "/images/logo-white.png" : "/images/logo.png"}
        alt="logo"
        width={30}
        height={30}
      />
      <span className="font-medium text-black dark:text-white">SmartSavvy</span>
    </Link>
  );
};

export const LogoBeta = () => {
  const { theme } = useTheme();

  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src={theme === "light" ? "/images/logo-white.png" : "/images/logo.png"}
        alt="logo"
        width={30}
        height={30}
      />
      <span className="font-medium text-black dark:text-white">SmartSavvy Beta</span>
    </Link>
  );
};