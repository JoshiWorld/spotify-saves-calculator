"use client";
import React from "react";
import { cn } from "@/lib/utils";
// @ts-expect-error || its exported
import type LinkTransition from "next-view-transitions";

export const Button = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | typeof LinkTransition
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-sm font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]",
    secondary: "bg-transparent shadow-none dark:text-white",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,42,53,0.06),0_1px_1px_rgba(0,0,0,0.05),0_0_0_1px_rgba(34,42,53,0.04),0_0_4px_rgba(34,42,53,0.08),0_16px_68px_rgba(47,48,55,0.05),0_1px_0_rgba(255,255,255,0.1)_inset]",
    gradient:
      "bg-linear-to-b from-purple-500 to-purple-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
    admin:
      "bg-linear-to-b from-red-500 to-red-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
    package:
      "bg-linear-to-b from-orange-500 to-orange-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      href={href ?? undefined}
      // @ts-expect-error || always true
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
