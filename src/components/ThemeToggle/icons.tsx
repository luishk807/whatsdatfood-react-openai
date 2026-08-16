/**
 * Inline rather than from an icon package: three glyphs are not worth a
 * dependency, and these inherit currentColor without any theming layer.
 */
const SIZE = { width: 16, height: 16, viewBox: "0 0 24 24" };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SunIcon = () => (
  <svg {...SIZE} {...STROKE} aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
);

export const MoonIcon = () => (
  <svg {...SIZE} {...STROKE} aria-hidden="true" focusable="false">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

export const SystemIcon = () => (
  <svg {...SIZE} {...STROKE} aria-hidden="true" focusable="false">
    <rect x="2.5" y="4" width="19" height="13" rx="2" />
    <path d="M8.5 21h7M12 17v4" />
  </svg>
);
