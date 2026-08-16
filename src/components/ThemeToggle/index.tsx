import { FC } from "react";
import clsx from "clsx";
import useTheme from "@/customHooks/useTheme";
import { THEME, THEME_LABELS } from "@/customConstants/theme";
import { ThemeToggleInterface, ThemeOptionInterface } from "@/interfaces/theme";
import { MoonIcon, SunIcon, SystemIcon } from "./icons";

const OPTIONS: ThemeOptionInterface[] = [
  { value: THEME.system, label: THEME_LABELS.system, icon: <SystemIcon /> },
  { value: THEME.light, label: THEME_LABELS.light, icon: <SunIcon /> },
  { value: THEME.dark, label: THEME_LABELS.dark, icon: <MoonIcon /> },
];

/**
 * A three-way switch rather than a light/dark flip, because "follow my
 * machine" is a real answer and a two-state toggle cannot express it: once you
 * tap it you are pinned to one theme forever.
 */
const ThemeToggle: FC<ThemeToggleInterface> = ({ expanded = false }) => {
  const { preference, choose } = useTheme();

  return (
    <div
      role="group"
      aria-label={THEME_LABELS.toggle}
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-pill border border-line bg-surface-sunken p-0.5",
        expanded && "w-full justify-between",
      )}
    >
      {OPTIONS.map((option) => {
        const selected = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={selected}
            title={option.label}
            onClick={() => choose(option.value)}
            className={clsx(
              "inline-flex items-center justify-center gap-1.5 rounded-pill px-2 py-1 text-xs transition-colors motion-reduce:transition-none",
              expanded && "flex-1",
              selected
                ? "bg-surface-raised text-ink shadow-tile"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {option.icon}
            {expanded && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
