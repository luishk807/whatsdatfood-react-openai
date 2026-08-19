import { type FC, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthPitch from "@/components/AuthPitch";
import AuthField from "@/components/AuthField";
import useAuth from "@/customHooks/useAuth";
import useLogin from "@/customHooks/useLogin";
import { AUTH_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

/**
 * The way in.
 *
 * This was a form floating in the middle of an otherwise empty page, headed
 * "Sign In" with a button marked "LOGIN" — a page that could belong to any
 * product. The food does the explaining now: real photographs from the
 * platform beside the form on a wide screen, a band of them above it on a
 * phone.
 *
 * No social sign-in and no password reset, because the backend has neither.
 * `login(username, password)` is the only auth mutation there is, and a button
 * that cannot work is worse than an absent one — the page used to carry a
 * "Forgot password?" link pointing at "/". `AUTH_PROVIDERS` on the signup page
 * is the slot the first of them goes in.
 *
 * The fields are `AuthField`, shared with signing up. The two pages were built
 * months apart and looked it.
 */
const SignInComponent: FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [failed, setFailed] = useState(false);

  const { login, loading } = useLogin();
  const { checkUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFailed(false);

    try {
      if (await login(identifier, password)) {
        await checkUser();
        navigate(ROUTES.home, { replace: true });
        return;
      }
    } catch {
      // Falls through to the same message. Which half was wrong is not
      // something to tell someone who may not own the account.
    }

    setFailed(true);
  };

  return (
    <div className="flex min-h-[70vh] w-full flex-col lg:min-h-[80vh] lg:flex-row">
      {/* A band on a phone, the larger half on a desktop. Never the whole
          screen: the form is what someone came here for. */}
      <div className="h-40 w-full shrink-0 sm:h-52 lg:h-auto lg:w-[55%]">
        <AuthPitch />
      </div>

      <div className="flex w-full items-start justify-center px-4 py-8 lg:w-[45%] lg:items-center">
        {/* Edge to edge on a phone, a card from `sm` up — the same frame as
            signing up. */}
        <div className="flex w-full max-w-[420px] flex-col gap-6 sm:rounded-2xl sm:border sm:border-line sm:bg-surface-raised sm:p-7">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {AUTH_LABELS.signInTitle}
            </h1>
            <p className="text-sm text-ink-muted">
              {AUTH_LABELS.signInSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthField
              id="identifier"
              name="username"
              label={AUTH_LABELS.identifier}
              autoComplete="username"
              required
              value={identifier}
              onChange={setIdentifier}
            />

            <AuthField
              id="password"
              type="password"
              label={AUTH_LABELS.password}
              autoComplete="current-password"
              required
              revealable
              value={password}
              onChange={setPassword}
            />

            {failed && (
              <p role="alert" className="text-sm text-danger">
                {AUTH_LABELS.failed}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-pill bg-brand px-4 text-base font-medium text-white hover:bg-brand-strong disabled:opacity-60"
            >
              {loading ? AUTH_LABELS.submitting : AUTH_LABELS.submit}
            </button>
          </form>

          <p className="text-sm text-ink-muted">
            {AUTH_LABELS.noAccount}{" "}
            <Link
              to={ROUTES.createAccount}
              className="font-medium text-ink underline underline-offset-2"
            >
              {AUTH_LABELS.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInComponent;
