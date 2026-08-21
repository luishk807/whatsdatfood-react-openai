import { type FC } from "react";
import Svg from "./Svg";
import { IconInterface } from "@/interfaces/icons";

/**
 * The food glyphs Lucide does not have.
 *
 * Lucide draws coffee, pizza, a croissant, a burger, a slice of cake and a
 * bowl of soup, and those are used directly. It has no sushi, no dumpling and
 * no taco — which are exactly the categories this product's readers care most
 * about, in a city where dim sum is not a niche.
 *
 * **These are drawn here rather than pulled from a second icon family.**
 * `react-icons` would cover them, but a second family is how an interface
 * ends up with two visual languages arguing on the same row — one glyph
 * filled and one outlined, at two weights, on the same card. Four drawings on
 * Lucide's own grid is a smaller price than that, and it is the same path the
 * product wants anyway: these are the first WhatsDatFood food illustrations,
 * and replacing them with commissioned artwork later is an edit to this file
 * with no migration, because the database stores `sushi` and never the name of
 * a component.
 */

/** Nigiri: a slab over a bed of rice, with the nori band that says sushi. */
export const SushiIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M3.2 14.6a2.8 2.8 0 0 1 2.8-2.8h12a2.8 2.8 0 0 1 2.8 2.8v1.6a2.8 2.8 0 0 1-2.8 2.8H6a2.8 2.8 0 0 1-2.8-2.8z" />
    <path d="M2.6 11.8c0-2.4 4.2-4.2 9.4-4.2s9.4 1.8 9.4 4.2" />
    <path d="M9.8 7.9v11.1M14.2 7.9v11.1" />
  </Svg>
);

/** A pleated dumpling, which is dim sum said in one shape. */
export const DumplingIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M2.8 17.4h18.4" />
    <path d="M2.8 17.4c0-4.6 4.1-8.2 9.2-8.2s9.2 3.6 9.2 8.2" />
    <path d="M7.4 11.6l1.3-2M12 9.2V6.8M16.6 11.6l-1.3-2" />
  </Svg>
);

/** A folded shell with filling above the fold. */
export const TacoIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M2.6 12.6a9.4 9.4 0 0 0 18.8 0" />
    <path d="M2.6 12.6h18.8" />
    <path d="M5 12.6a2.4 2.4 0 0 1 4.8 0M9.6 12.6a2.4 2.4 0 0 1 4.8 0M14.2 12.6a2.4 2.4 0 0 1 4.8 0" />
  </Svg>
);

/** A bowl with chopsticks — noodles generally, where soup is broth. */
export const NoodlesIcon: FC<IconInterface> = (props) => (
  <Svg {...props}>
    <path d="M2.8 12.4h15.4a7.7 7.7 0 0 1-15.4 0z" />
    <path d="M6.6 12.4c0-2.3.9-3.5 2.1-3.5M10.5 12.4c0-3 1.1-4.4 2.4-4.4M14.4 12.4c0-2.3.9-3.5 2.1-3.5" />
    <path d="M15.2 5.2l5.8 3.6M17.4 3.4l3.8 5.6" />
  </Svg>
);
