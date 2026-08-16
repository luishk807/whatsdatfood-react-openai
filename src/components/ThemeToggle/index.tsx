import { FC, useEffect, useRef, useState } from "react";
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
 * Three choices, one button.
 *
 * Not a light/dark flip: "follow my machine" is a real answer and a two-state
 * toggle cannot express it - the first tap pins you to one theme forever. But
 * three controls sitting in the header is three controls of noise for
 * something touched once, so on desktop it collapses to a single icon that
 * opens the choice. The mobile sheet has room, and shows all three flat.
 */
const ThemeToggle: FC<ThemeToggleInterface> = ({ expanded = false }) => {
  const { preference, resolved, choose } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const optionButton = (option: ThemeOptionInterface, flat: boolean) => {
    const selected = preference === option.value;

    return (
      <button
        key={option.value}
        type="button"
        aria-label={option.label}
        aria-pressed={selected}
        onClick={() => {
          choose(option.value);
          setOpen(false);
        }}
        className={clsx(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
          flat ? "flex-1 justify-center" : "w-full text-left",
          selected
            ? "bg-surface-sunken font-medium text-ink"
            : "text-ink-muted hover:text-ink",
        )}
      >
        {option.icon}
        <span>{option.label}</span>
      </button>
    );
  };

  if (expanded) {
    return (
      <div
        role="group"
        aria-label={THEME_LABELS.toggle}
        className="flex w-full gap-1 rounded-pill border border-line p-1"
      >
        {OPTIONS.map((option) => optionButton(option, true))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={THEME_LABELS.toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink"
      >
        {resolved === THEME.dark ? <MoonIcon /> : <SunIcon />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-card border border-line bg-surface-raised p-1 shadow-tile"
        >
          {OPTIONS.map((option) => optionButton(option, false))}
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
