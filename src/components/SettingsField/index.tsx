import { type FC } from "react";
import { SettingsFieldInterface } from "@/interfaces/users";

/**
 * One labelled input on the settings page.
 *
 * Its own component rather than the shared TextField, which keeps the value in
 * internal state and syncs from a prop — a second source of truth for a form
 * whose values are already held by the page.
 */
const SettingsField: FC<SettingsFieldInterface> = ({
  name,
  label,
  value,
  type = "text",
  hint,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={name} className="text-sm text-ink">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      autoComplete={type === "password" ? "new-password" : name}
      aria-describedby={hint ? `${name}-hint` : undefined}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-card border border-line bg-surface-raised px-3 py-2 text-base text-ink"
    />
    {hint && (
      <p id={`${name}-hint`} className="text-xs text-ink-muted">
        {hint}
      </p>
    )}
  </div>
);

export default SettingsField;
