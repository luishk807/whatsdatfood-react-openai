import { FC } from "react";
import {
  CameraIcon,
  HeartIcon,
  PeopleIcon,
  ScheduleIcon,
  SettingsIcon,
  StarIcon,
  StorefrontIcon,
  UserIcon,
  UtensilsIcon,
} from "@/components/icons";
import { AccountIcon } from "@/customConstants/account";
import { IconInterface } from "@/interfaces/icons";

/**
 * The little glyph beside each row of the account menu.
 *
 * **These used to be a second, hand-drawn icon set**, duplicating shapes that
 * `@/components/icons` already had — a different star from the rating star, a
 * different storefront from the owner console's, a clock nothing else used.
 * Two sets is how an interface ends up with two visual languages, and it meant
 * a chevron redrawn in one place quietly disagreed with the other.
 *
 * Now this is a lookup into the one icon module and nothing else. It stays a
 * separate file only because `ACCOUNT_GROUPS` names its icons as data —
 * `"gear"` rather than a component — which is the same separation the taste
 * categories use, and for the same reason: the menu's shape is configuration,
 * and how it is drawn is not.
 */
const GLYPHS: Record<AccountIcon, FC<IconInterface>> = {
  camera: CameraIcon,
  heart: HeartIcon,
  clock: ScheduleIcon,
  star: StarIcon,
  people: PeopleIcon,
  storefront: StorefrontIcon,
  gear: SettingsIcon,
  utensils: UtensilsIcon,
};

export const AccountRowIcon: FC<{ name: AccountIcon }> = ({ name }) => {
  const Glyph = GLYPHS[name] ?? SettingsIcon;

  return <Glyph size={18} />;
};

/**
 * The account button in the header, which is the one place a person glyph
 * stands alone rather than beside a label.
 *
 * Re-exported from here rather than imported directly by the header, so this
 * file stays the single seam between the account menu and the icon system.
 */
export const PersonIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <UserIcon size={size} />
);
