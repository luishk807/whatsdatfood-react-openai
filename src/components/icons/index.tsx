import { type FC } from "react";
import { IconInterface } from "@/interfaces/icons";

/**
 * The icons the app actually uses, as inline SVG.
 *
 * These replaced `@mui/icons-material`, where every icon pulls in `SvgIcon` and
 * therefore emotion — roughly the entire styling runtime for the sake of a
 * chevron. They are drawn on a 24x24 grid in `currentColor`, so they inherit
 * text colour and need no `dark:` handling.
 *
 * Every one of them sits inside a control that already carries its own label,
 * so they are `aria-hidden` by default; pass `title` for the rare standalone
 * case and the icon becomes an `img` with an accessible name instead.
 */
const Svg: FC<IconInterface & { children: React.ReactNode; fill?: boolean }> = ({
  size = 24,
  className,
  title,
  children,
  fill = false,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill={fill ? "currentColor" : "none"}
    stroke={fill ? "none" : "currentColor"}
    strokeWidth={fill ? undefined : 1.8}
    strokeLinecap={fill ? undefined : "round"}
    strokeLinejoin={fill ? undefined : "round"}
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

export const CloseIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const ScheduleIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 1.9" />
  </Svg>
);

export const StorefrontIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M3.5 9l1.4-5h14.2l1.4 5" />
    <path d="M4.5 9.2V20h15V9.2" />
    <path d="M9.5 20v-5.5h5V20" />
  </Svg>
);

export const FlameIcon: FC<IconInterface> = (props) => (
  <Svg {...props} fill>
    <path d="M12.9 2.2c.4 2.7 2.2 4 3.4 5.6A6.9 6.9 0 0 1 17.8 12a5.8 5.8 0 0 1-11.6 0c0-1.8.7-3.4 1.9-4.6.1 1.2.7 2 1.5 2.3.9.4 1.6-.3 1.5-1.6-.1-1.5-.2-3.5.8-5.9z" />
  </Svg>
);

export const NoPhotographyIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M9.4 4h5.2l1.4 2.4H20A1.5 1.5 0 0 1 21.5 8v9.6" />
    <path d="M19 20H4a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 4 6.4h2" />
    <path d="M14.6 10.6a3.6 3.6 0 0 1-5 5" />
    <path d="M3 3l18 18" />
  </Svg>
);

export const ThumbUpIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M7.2 10.4V20H4.4A1.4 1.4 0 0 1 3 18.6v-6.8a1.4 1.4 0 0 1 1.4-1.4z" />
    <path d="M7.2 10.4l4.3-6.8a1.9 1.9 0 0 1 3.3 1.9l-1.5 3.6h5.3A1.9 1.9 0 0 1 20.4 11l-1.5 6.8A1.9 1.9 0 0 1 17 20H7.2" />
  </Svg>
);

export const ThumbDownIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <g transform="rotate(180 12 12)">
      <path d="M7.2 10.4V20H4.4A1.4 1.4 0 0 1 3 18.6v-6.8a1.4 1.4 0 0 1 1.4-1.4z" />
      <path d="M7.2 10.4l4.3-6.8a1.9 1.9 0 0 1 3.3 1.9l-1.5 3.6h5.3A1.9 1.9 0 0 1 20.4 11l-1.5 6.8A1.9 1.9 0 0 1 17 20H7.2" />
    </g>
  </Svg>
);

export const FlagIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M5 21V3.8" />
    <path d="M5 4.6h12.2l-2 3.9 2 3.9H5" />
  </Svg>
);

export const CheckCircleIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.1 12.2l2.7 2.7 5.1-5.8" />
  </Svg>
);

export const AddAPhotoIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M12.6 4H9.4L8 6.4H4A1.5 1.5 0 0 0 2.5 8v10.5A1.5 1.5 0 0 0 4 20h16a1.5 1.5 0 0 0 1.5-1.5v-6.1" />
    <circle cx="12" cy="13.2" r="3.6" />
    <path d="M18.4 2.5v5.8M15.5 5.4h5.8" />
  </Svg>
);

export const StarIcon: FC<IconInterface> = (props) => (
  <Svg {...props} fill>
    <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5L12 17.5l-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z" />
  </Svg>
);

export const VisibilityIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M2.2 12S5.8 5.6 12 5.6 21.8 12 21.8 12 18.2 18.4 12 18.4 2.2 12 2.2 12z" />
    <circle cx="12" cy="12" r="3.1" />
  </Svg>
);

export const VisibilityOffIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M9.8 5.9A9.3 9.3 0 0 1 12 5.6c6.2 0 9.8 6.4 9.8 6.4a17 17 0 0 1-3.2 4" />
    <path d="M6.3 7.9A16.7 16.7 0 0 0 2.2 12S5.8 18.4 12 18.4a9.6 9.6 0 0 0 3.9-.8" />
    <path d="M9.9 9.9a3.1 3.1 0 0 0 4.3 4.3" />
    <path d="M3 3l18 18" />
  </Svg>
);

export const ChevronLeftIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M14.8 5.6L8.4 12l6.4 6.4" />
  </Svg>
);

export const ChevronRightIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M9.2 5.6L15.6 12l-6.4 6.4" />
  </Svg>
);

/**
 * A map pin, for "near me". Not an arrow or a crosshair — both read as
 * "navigate me there", and this only ever means "somewhere around here".
 */
export const PinIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M12 21.5s7-6.2 7-11.2a7 7 0 1 0-14 0c0 5 7 11.2 7 11.2z" />
    <circle cx="12" cy="10.2" r="2.6" />
  </Svg>
);

export const MedalIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="15" r="5.4" />
    <path d="M8.6 10.2L6.2 3.4h11.6l-2.4 6.8" />
  </Svg>
);

export const ListIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
    <path d="M3.6 6.5h.01M3.6 12h.01M3.6 17.5h.01" />
  </Svg>
);

export const MapIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M9.2 4.2L3.6 6.4v13.4l5.6-2.2 5.6 2.2 5.6-2.2V4.2l-5.6 2.2z" />
    <path d="M9.2 4.2v13.4M14.8 6.4v13.4" />
  </Svg>
);
