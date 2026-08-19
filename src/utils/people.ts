import { UserType } from "@/interfaces/users";

/**
 * What to call somebody on screen.
 *
 * Three places worked this out independently as `first_name last_name`, which
 * means an account that has a display name would have kept showing its legacy
 * name parts in two of them — and every account created from now on has a
 * display name and only a derived split of it in those columns.
 *
 * The handle is the last resort rather than the first: `@ada_lovelace2` is an
 * implementation detail of URLs, not a name.
 */
export const displayName = (
  user: Pick<UserType, "display_name" | "first_name" | "last_name" | "username">
    | null
    | undefined,
): string => {
  if (!user) {
    return "";
  }

  return (
    user.display_name?.trim() ||
    [user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
    user.username ||
    ""
  );
};
