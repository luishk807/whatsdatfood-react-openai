import { ReactNode } from "react";
import { ThemePreference, ResolvedTheme } from "@/types";

export interface ThemeStateInterface {
  preference: ThemePreference;
  /** What is on screen; "system" already resolved against the OS. */
  resolved: ResolvedTheme;
}

export interface ThemeToggleInterface {
  /** Rendered flat rather than as a compact group; used in the mobile menu. */
  expanded?: boolean;
}

export interface ThemeOptionInterface {
  value: ThemePreference;
  label: string;
  icon: ReactNode;
}
