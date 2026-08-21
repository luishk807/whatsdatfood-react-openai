import { type FC, type ReactNode } from "react";
import { IconInterface } from "@/interfaces/icons";

/**
 * The primitive our own drawings use, matching what Lucide produces exactly:
 * a 24x24 grid, `currentColor`, round caps and joins, stroke 1.8.
 *
 * It exists so a hand-drawn glyph sitting beside a Lucide one is
 * indistinguishable in weight and alignment. This is also the file that
 * future WhatsDatFood artwork is drawn into — the category data model names a
 * slug, never a component, so replacing one of these with a commissioned
 * illustration changes this module and nothing else.
 */
export const ICON_STROKE = 1.8;

const Svg: FC<IconInterface & { children: ReactNode }> = ({
  size = 24,
  className,
  title,
  children,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={ICON_STROKE}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

export default Svg;
