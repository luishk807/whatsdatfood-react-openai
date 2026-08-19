import { type FC, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthPitch from "@/components/AuthPitch";
import AuthField from "@/components/AuthField";
import useAuth from "@/customHooks/useAuth";
import useLogin from "@/customHooks/useLogin";
import useUser from "@/customHooks/useUser";
import { ACCOUNT } from "@/customConstants/account";
import { AUTH_PROVIDERS } from "@/customConstants/auth";
import { AUTH_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

/**
 * Signing up.
 *
 * This was seven boxes — first name, last name, email, phone, username,
 * password, password again — under a bold "Create Account" and above a button
 * marked REGISTER. It asked for more personal information than the product has
 * ever used, before anybody had seen a single dish, and it looked like the
 * admin screen of a database rather than the front door of a food app.
 *
 * Three fields now. The handle is derived from the display name server-side
 * and can be changed later from settings; the phone number is asked for if
 * something ever needs to reach somebody, which nothing does.
 *
 * Signing up signs you in. Making somebody type the password they chose four
 * seconds ago into a second form is a step that exists only because the two
 * mutations are separate.
 */
const CreateAccount: FC = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failure, setFailure] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { createUser, submitUserQuery } = useUser();
  const { login } = useLogin();
  const { checkUser } = useAuth();
  const navigate = useNavigate();

  const busy = submitting || submitUserQuery.loading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailure("");
    setSubmitting(true);

    try {
      await createUser({
        display_name: displayName.trim(),
        email: email.trim(),
        password,
      });

      // Straight in, rather than back to a sign-in form. An email works as an
      // identifier now, which matters most here: the handle was derived
      // server-side and the new account holder has never seen it.
      if (await login(email.trim(), password)) {
        await checkUser();
        navigate(ROUTES.home, { replace: true });
        return;
      }

      // The account exists either way, so send them to sign in rather than
      // claiming signup failed and inviting a second attempt on a taken email.
      navigate(ROUTES.signIn, { replace: true });
    } catch (error) {
      // Verbatim. Every refusal the server sends here explains a rule — that
      // email already has an account, the password is too short — and
      // replacing it with "Could not create that account" turns an
      // explanation into a dead end.
      setFailure(
        error instanceof Error && error.message
          ? error.message
          : AUTH_LABELS.registerFailed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full flex-col lg:min-h-[80vh] lg:flex-row">
      {/* A band on a phone, the larger half on a desktop — the same frame as
          signing in. The photographs are the argument for making an account. */}
      <div className="h-40 w-full shrink-0 sm:h-52 lg:h-auto lg:w-[55%]">
        <AuthPitch />
      </div>

      <div className="flex w-full items-start justify-center px-4 py-8 lg:w-[45%] lg:items-center">
        {/* Edge to edge on a phone, a card from `sm` up: a card inside a 360px
            screen is a border drawn just inside another border. */}
        <div className="flex w-full max-w-[420px] flex-col gap-6 sm:rounded-2xl sm:border sm:border-line sm:bg-surface-raised sm:p-7">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {AUTH_LABELS.registerTitle}
            </h1>
            <p className="text-sm text-ink-muted">
              {AUTH_LABELS.registerSubtitle}
            </p>
          </div>

          {/* Empty until there is an OAuth endpoint to point at — see
              AUTH_PROVIDERS. The divider goes with them: "or continue with
              email" above the only way in reads as a missing option. */}
          {AUTH_PROVIDERS.length > 0 && (
            <div className="flex flex-col gap-3">
              {AUTH_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={provider.onSelect}
                  className="h-12 w-full rounded-card border border-line bg-surface px-4 text-base font-medium text-ink hover:bg-surface-sunken"
                >
                  {AUTH_LABELS.continueWith(provider.label)}
                </button>
              ))}

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-ink-muted">
                  {AUTH_LABELS.orWithEmail}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthField
              id="display_name"
              label={AUTH_LABELS.displayName}
              placeholder={AUTH_LABELS.displayNamePlaceholder}
              autoComplete="nickname"
              required
              value={displayName}
              onChange={setDisplayName}
            />

            <AuthField
              id="email"
              type="email"
              label={AUTH_LABELS.email}
              placeholder={AUTH_LABELS.emailPlaceholder}
              autoComplete="email"
              required
              value={email}
              onChange={setEmail}
            />

            <AuthField
              id="password"
              type="password"
              label={AUTH_LABELS.password}
              hint={AUTH_LABELS.passwordHint(ACCOUNT.MIN_PASSWORD)}
              autoComplete="new-password"
              required
              revealable
              value={password}
              onChange={setPassword}
            />

            {failure && (
              <p role="alert" className="text-sm text-danger">
                {failure}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="h-12 w-full rounded-pill bg-brand px-4 text-base font-medium text-white hover:bg-brand-strong disabled:opacity-60"
            >
              {busy ? AUTH_LABELS.registering : AUTH_LABELS.register}
            </button>

            <p className="text-xs leading-relaxed text-ink-muted">
              {AUTH_LABELS.legalPrefix}{" "}
              <Link to={ROUTES.terms} className="underline underline-offset-2">
                {AUTH_LABELS.legalTerms}
              </Link>{" "}
              {AUTH_LABELS.legalAnd}{" "}
              <Link
                to={ROUTES.privacy}
                className="underline underline-offset-2"
              >
                {AUTH_LABELS.legalPrivacy}
              </Link>
              {AUTH_LABELS.legalSuffix}
            </p>
          </form>

          {/* This replaces "Back to Login", which named the mechanism rather
              than the reason anybody would want it. */}
          <p className="text-sm text-ink-muted">
            {AUTH_LABELS.haveAccount}{" "}
            <Link
              to={ROUTES.signIn}
              className="font-medium text-ink underline underline-offset-2"
            >
              {AUTH_LABELS.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
