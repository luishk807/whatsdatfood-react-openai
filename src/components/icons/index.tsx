import { type FC } from "react";
import {
  ArrowRight,
  Award,
  CakeSlice,
  Camera,
  CameraOff,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Coffee,
  Croissant,
  Drumstick,
  EggFried,
  Eye,
  EyeOff,
  Fish,
  Flag,
  Flame,
  Hamburger,
  Heart,
  ImagePlus,
  List,
  LocateFixed,
  type LucideIcon,
  Map,
  MapPin,
  Medal,
  Pencil,
  Pizza,
  Plus,
  Salad,
  Search,
  Settings,
  SlidersHorizontal,
  Soup,
  Star,
  Store,
  ThumbsDown,
  ThumbsUp,
  Trophy,
  User,
  Users,
  Utensils,
  Wheat,
  X,
} from "lucide-react";
import { IconInterface } from "@/interfaces/icons";

/**
 * Every icon in the application, and the only module that names an icon
 * library.
 *
 * **Lucide draws these now.** They used to be hand-drawn inline SVG, which was
 * itself a replacement for `@mui/icons-material` — where every icon pulled in
 * `SvgIcon` and therefore the whole emotion runtime for the sake of a chevron.
 * Lucide reintroduces none of that: it is tree-shaken ES modules with no
 * styling runtime, so only the icons named above are bundled.
 *
 * The swap was cheap because the hand-drawn set was already drawn in Lucide's
 * language — 24x24, `currentColor`, round caps — so this is one visual system
 * becoming the same system with a maintainer, rather than a redesign. **No
 * call site changed.** All twenty-five of them still import from
 * `@/components/icons`, which is the point: the module is the seam, so
 * swapping a library, or replacing one glyph with our own artwork, is an edit
 * here and nowhere else.
 *
 * **Do not import `lucide-react` anywhere but this file.** Two components
 * reaching for their own icons is how an application ends up with three
 * chevrons at three weights, and it defeats the seam above.
 *
 * `stroke-width` is 1.8 rather than Lucide's default 2, which is the weight
 * the rest of this interface was drawn at and matches the type.
 *
 * Every icon sits inside a control that already carries its own label, so they
 * are `aria-hidden` by default; pass `title` for the rare standalone case and
 * the icon becomes an `img` with an accessible name instead.
 */

/** The one stroke weight, set once. */
const STROKE = 1.8;

/**
 * Wrap a Lucide glyph in this application's icon contract.
 *
 * Sizing, stroke, focusability and the accessibility default are decided here
 * and cannot drift per component — which is the whole reason call sites take a
 * `size` and nothing else.
 */
const icon =
  (Glyph: LucideIcon, { filled = false }: { filled?: boolean } = {}): FC<IconInterface> =>
  ({ size = 24, className, title }) => (
    <Glyph
      size={size}
      className={className}
      strokeWidth={STROKE}
      fill={filled ? "currentColor" : "none"}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    />
  );

// --- interface ----------------------------------------------------------

export const CloseIcon = icon(X);
export const ScheduleIcon = icon(Clock);
export const StorefrontIcon = icon(Store);
export const ThumbUpIcon = icon(ThumbsUp);
export const ThumbDownIcon = icon(ThumbsDown);
export const FlagIcon = icon(Flag);
export const CheckCircleIcon = icon(CircleCheck);
export const CheckIcon = icon(Check);
export const PlusIcon = icon(Plus);
export const EditIcon = icon(Pencil);
export const SearchIcon = icon(Search);
export const SettingsIcon = icon(Settings);
export const FilterIcon = icon(SlidersHorizontal);
export const UserIcon = icon(User);
export const PeopleIcon = icon(Users);
export const CameraIcon = icon(Camera);
export const HeartIcon = icon(Heart);
export const TrophyIcon = icon(Trophy);
export const AwardIcon = icon(Award);
export const ArrowRightIcon = icon(ArrowRight);
export const ChevronLeftIcon = icon(ChevronLeft);
export const ChevronRightIcon = icon(ChevronRight);
export const ListIcon = icon(List);
export const MapIcon = icon(Map);
export const MedalIcon = icon(Medal);
export const VisibilityIcon = icon(Eye);
export const VisibilityOffIcon = icon(EyeOff);

/** Filled, because both of these are marks rather than outlines. */
export const StarIcon = icon(Star, { filled: true });
export const FlameIcon = icon(Flame, { filled: true });

/**
 * A map pin, for "near me". Not an arrow or a crosshair — both read as
 * "navigate me there", and this only ever means "somewhere around here".
 */
export const PinIcon = icon(MapPin);

/**
 * Back to my location, on the map. A crosshair rather than a pin: the pin
 * already means "a place", and this control means "the middle again".
 */
export const RecentreIcon = icon(LocateFixed);

/** The upload affordance. A picture with a plus, never a crossed-out camera —
 * one reads as "waiting", the other as "broken". */
export const AddAPhotoIcon = icon(ImagePlus);

/** A photograph that failed, which is a different statement from one that was
 * never taken. */
export const NoPhotographyIcon = icon(CameraOff);

// --- food -----------------------------------------------------------------
//
// Lucide covers most of what a taste category needs. What it cannot draw —
// sushi, a dumpling, a taco — is in `./food`, drawn in the same language, and
// the mapping from a category slug to any of these lives in
// `customConstants/foodIcons.tsx` rather than in a component.

export const CoffeeIcon = icon(Coffee);
export const PizzaIcon = icon(Pizza);
export const SoupIcon = icon(Soup);
export const DessertIcon = icon(CakeSlice);
export const BakeryIcon = icon(Croissant);
export const BurgerIcon = icon(Hamburger);
export const BbqIcon = icon(Drumstick);
export const BrunchIcon = icon(EggFried);
export const SaladIcon = icon(Salad);
export const SeafoodIcon = icon(Fish);
export const UtensilsIcon = icon(Utensils);
export const WheatIcon = icon(Wheat);
