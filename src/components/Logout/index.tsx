import { type FC, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthButton, { AuthLink } from "@/components/AuthButton";
import AuthCard from "@/components/AuthCard";
import { CheckCircleIcon } from "@/components/icons";
import useAuth from "@/customHooks/useAuth";
import { AUTH_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

/**
 * The one page somebody sees on their way out.
 *
 * It used to be two small sentences pinned to the top third of an otherwise
 * empty screen — "You are successfully logged out! Thank you!" — under a
 * bordered, uppercase, full-width button that looked nothing like the green
 * one they had pressed to get in. It read like a printer receipt.
 *
 * Now it is the same card, the same button and the same type as the sign-in
 * page, centred in the room the header and footer leave. `AuthCard` and
 * `AuthButton` are shared with signing in and signing up, so this screen
 * cannot drift away from them again.
 *
 * **The copy is a farewell, not a confirmation.** Somebody leaving is the one
 * reader worth giving a reason to come back, so the message asks a question
 * and the card offers a way in rather than only a way out.
 *
 * **The authentication is untouched.** The same effect, the same `logout()`,
 * the same one-shot on mount — only what is drawn around it changed.
 */
const Logout: FC = () => {
  const navigate = useNavigate();
  const { logout, logoutQuery, user } = useAuth();
  const { loading } = logoutQuery;

  // Once. React runs effects twice in development, and the second pass used to
  // fire a second logout — harmless against this API, but it is still a
  // request nobody asked for.
  const started = useRef(false);

  useEffect(() => {
    if (user && !started.current) {
      started.current = true;
      logout();
    }
    // Deliberately on mount only: this is the page that signs somebody out,
    // and re-running it when the user object settles would sign them out again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthCard standalone>
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <CheckCircleIcon size={26} />
        </span>

        <div className="flex flex-col gap-1.5">
          {/* One `h1`: this is a page, and it had none at all before. */}
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {loading ? AUTH_LABELS.signingOut : AUTH_LABELS.signedOutTitle}
          </h1>
          <p className="text-sm text-ink-muted">{AUTH_LABELS.signedOutBody}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* The primary action points forward, at the food, rather than back at
            the form they just left. */}
        <AuthButton onClick={() => navigate(ROUTES.home)}>
          {AUTH_LABELS.backHome}
        </AuthButton>

        <AuthLink to={ROUTES.signIn}>{AUTH_LABELS.signInAgain}</AuthLink>
      </div>
    </AuthCard>
  );
};

export default Logout;
