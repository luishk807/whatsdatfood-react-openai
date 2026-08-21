import { type FC } from "react";
import clsx from "clsx";
import { AuthCardInterface } from "@/interfaces/auth";

/**
 * The frame every auth page's content sits in.
 *
 * Sign in, create account and sign out were three screens with three ideas
 * about how wide a panel is, whether it has a border, and how much room to
 * leave around it — the logout page was a 500px `div` in a stylesheet of its
 * own, with the message floating in the top third of an empty page.
 *
 * One frame instead: **edge to edge on a phone, a bordered card from `sm` up**,
 * at the width the sign-in form already used. Changing it changes all three,
 * which is the point.
 *
 * `standalone` centres the card in whatever room the header and footer leave.
 * The auth pages do not need it — they are a two-column layout and the column
 * does the centring — and the logout page does, because it is the only content
 * on the screen.
 */
const AuthCard: FC<AuthCardInterface> = ({
  children,
  standalone = false,
  className,
}) => {
  const card = (
    <div
      className={clsx(
        "flex w-full max-w-[420px] flex-col gap-6 sm:rounded-2xl sm:border sm:border-line sm:bg-surface-raised sm:p-7",
        // Only where the card is the whole page. Beside a form it would be a
        // second shadow competing with the panel next to it.
        standalone && "sm:shadow-tile",
        className,
      )}
    >
      {children}
    </div>
  );

  if (!standalone) {
    return card;
  }

  return (
    // Vertically centred in the space between the header and the footer, and
    // no taller than it needs to be on a phone — the old page reserved a
    // screen and a half of nothing.
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-10 sm:min-h-[70vh]">
      {card}
    </div>
  );
};

export default AuthCard;
