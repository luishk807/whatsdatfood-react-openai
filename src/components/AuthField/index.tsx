import { type FC, useId, useState } from "react";
import clsx from "clsx";
import { VisibilityIcon, VisibilityOffIcon } from "@/components/icons";
import { AUTH_LABELS } from "@/customConstants/labels";
import { AuthFieldInterface } from "@/interfaces/auth";

/**
 * One field on an auth page: a label, an input, and whatever that particular
 * field needs said about it.
 *
 * Shared between signing in and signing up so the two pages cannot drift —
 * they were built months apart and looked it, one a bare column of 40px boxes
 * and the other a pill-buttoned card.
 *
 * The box is 48px tall. Anything shorter is a thumb target that misses on a
 * phone, which is the only screen that matters here.
 */
const AuthField: FC<AuthFieldInterface> = ({
  id,
  label,
  value,
  onChange,
  type = "text",
  name,
  autoComplete,
  placeholder,
  hint,
  required,
  error,
  revealable,
}) => {
  const [revealed, setRevealed] = useState(false);
  const hintId = useId();
  const showsReveal = revealable && type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={showsReveal && revealed ? "text" : type}
          value={value}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-describedby={hint || error ? hintId : undefined}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={clsx(
            "h-12 w-full rounded-card border bg-surface-raised px-3.5 text-base text-ink placeholder:text-ink-muted/70",
            showsReveal && "pr-20",
            error ? "border-danger" : "border-line",
          )}
        />

        {/* A password typed on a phone, one-handed, in a dim room is mistyped
            often enough that hiding it by default without offering to show it
            is the wrong trade. */}
        {showsReveal && (
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
        )}
      </div>

      {(error || hint) && (
        <p
          id={hintId}
          className={clsx("text-xs", error ? "text-danger" : "text-ink-muted")}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
};

export default AuthField;
