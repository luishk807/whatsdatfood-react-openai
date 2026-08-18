import { type FC, type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { VisibilityIcon, VisibilityOffIcon } from "@/components/icons";
import AuthPitch from "@/components/AuthPitch";
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
 * "Forgot password?" link pointing at "/".
 */
const SignInComponent: FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState(false);
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
        <div className="flex w-full max-w-[420px] flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {AUTH_LABELS.signInTitle}
            </h1>
            <p className="text-sm text-ink-muted">
              {AUTH_LABELS.signInSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="identifier" className="text-sm text-ink">
                {AUTH_LABELS.identifier}
              </label>
              <input
                id="identifier"
                name="username"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-card border border-line bg-surface-raised px-3 py-2.5 text-base text-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-ink">
                {AUTH_LABELS.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={revealed ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-card border border-line bg-surface-raised px-3 py-2.5 pr-20 text-base text-ink"
                />
                {/* A password typed on a phone, one-handed, in a dim room is
                    mistyped often enough that hiding it by default without
                    offering to show it is the wrong trade. */}
                <button
                  type="button"
                  onClick={() => setRevealed((prev) => !prev)}
                  aria-pressed={revealed}
                  className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full px-2 py-1 text-xs text-ink-muted hover:text-ink"
                >
                  {revealed ? (
                    <VisibilityOffIcon size={15} />
                  ) : (
                    <VisibilityIcon size={15} />
                  )}
                  {revealed ? AUTH_LABELS.hide : AUTH_LABELS.show}
                </button>
              </div>
            </div>

            {failed && (
              <p role="alert" className="text-sm text-danger">
                {AUTH_LABELS.failed}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-pill bg-brand px-4 py-2.5 text-base font-medium text-white hover:bg-brand-strong disabled:opacity-60"
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
