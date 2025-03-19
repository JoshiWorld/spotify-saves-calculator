"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

interface Props extends ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: Props) {
  // const [mounted, setMounted] = React.useState(false);

  // React.useEffect(() => {
  //   setMounted(true);
  // }, []);

  // const initialTheme = mounted ? String(localStorage.theme) : "dark";

  // if (!mounted) {
  //   return <>{children}</>;
  // }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={"dark"}
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
