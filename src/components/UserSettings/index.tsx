import { type FC, type FormEvent, useEffect, useState } from "react";
import useUser from "@/customHooks/useUser";
import { UserType } from "@/interfaces/users";
import DeleteAccount from "@/components/DeleteAccount";
import SettingsField from "@/components/SettingsField";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { ACCOUNT } from "@/customConstants/account";
import { displayName } from "@/utils/people";

/**
 * Settings, as cards rather than one long column of inputs.
 *
 * It was a single form holding name, email, phone, username and two
 * always-visible password boxes, with an irreversible delete control sitting
 * level with the First Name field. Everything carried the same weight, so
 * nothing read as more consequential than anything else.
 *
 * Three things are separated because they are three different decisions: what
 * other people see, what only you see, and changing a password — which is an
 * action rather than a field, so it stays behind a button until it is asked for.
 */
const UserSettings: FC = () => {
  const { getUserInfo, updateUser } = useUser();

  // No first and last name. They are still columns — filled from the display
  // name at signup and read by nothing since every renderer went through
  // `displayName()` — and four name fields on one card is the clutter the
  // signup page was just cured of.
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    email: "",
    phone: "",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "failed">(
    "idle",
  );

  const [changingPassword, setChangingPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordDone, setPasswordDone] = useState(false);

  useEffect(() => {
    let live = true;

    getUserInfo().then((resp) => {
      const user = resp as UserType | undefined;

      if (!live || !user) {
        return;
      }

      setForm({
        // Falls back to the name parts for an account created before the
        // column existed, so its owner sees their own name rather than a
        // blank box that would wipe it on the next save.
        display_name: displayName(user),
        username: user.username ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
    });

    return () => {
      live = false;
    };
    // Once, on mount. getUserInfo is a fresh identity on every render, and a
    // fresh identity in a dependency list is how this codebase has produced a
    // request loop three times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: keyof typeof form) => (value: string) => {
    setStatus("idle");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");

    try {
      await updateUser(form);
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  };

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordDone(false);

    if (password.length < ACCOUNT.MIN_PASSWORD) {
      setPasswordError(SETTINGS_LABELS.passwordTooShort);
      return;
    }

    if (password !== confirmation) {
      setPasswordError(SETTINGS_LABELS.passwordMismatch);
      return;
    }

    try {
      await updateUser({ password });
      setPassword("");
      setConfirmation("");
      setChangingPassword(false);
      setPasswordDone(true);
    } catch {
      setPasswordError(SETTINGS_LABELS.saveFailed);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <form onSubmit={handleSave} className="flex flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-card border border-line p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-ink">
              {SETTINGS_LABELS.profileTitle}
            </h2>
            <p className="text-sm text-ink-muted">
              {SETTINGS_LABELS.profileBlurb}
            </p>
          </div>

          <SettingsField
            name="display_name"
            label={SETTINGS_LABELS.displayName}
            hint={SETTINGS_LABELS.displayNameHint}
            value={form.display_name}
            onChange={set("display_name")}
          />

          {/* Where the derived handle gets changed. Signup no longer asks for
              one, so this is the first time most people see theirs. */}
          <SettingsField
            name="username"
            label={SETTINGS_LABELS.username}
            hint={SETTINGS_LABELS.usernameHint}
            value={form.username}
            onChange={set("username")}
          />
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-line p-5">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-ink">
              {SETTINGS_LABELS.accountTitle}
            </h2>
            <p className="text-sm text-ink-muted">
              {SETTINGS_LABELS.accountBlurb}
            </p>
          </div>

          <SettingsField
            name="email"
            type="email"
            label={SETTINGS_LABELS.email}
            value={form.email}
            onChange={set("email")}
          />
          <SettingsField
            name="phone"
            type="tel"
            label={SETTINGS_LABELS.phone}
            value={form.phone}
            onChange={set("phone")}
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "saving"}
            className="rounded-pill bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-60"
          >
            {status === "saving" ? SETTINGS_LABELS.saving : SETTINGS_LABELS.save}
          </button>

          {status === "saved" && (
            <span role="status" className="text-sm text-ink-muted">
              {SETTINGS_LABELS.saved}
            </span>
          )}
          {status === "failed" && (
            <span role="alert" className="text-sm text-danger">
              {SETTINGS_LABELS.saveFailed}
            </span>
          )}
        </div>
      </form>

      {/* An action, not a field. Two password boxes sitting open on a settings
          page suggest the password is something you re-enter to save anything
          else. */}
      <section className="flex flex-col gap-4 rounded-card border border-line p-5">
        <h2 className="text-base font-semibold text-ink">
          {SETTINGS_LABELS.passwordTitle}
        </h2>

        {!changingPassword ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setChangingPassword(true)}
              className="self-start rounded-pill border border-line px-3 py-1.5 text-sm text-ink hover:border-ink"
            >
              {SETTINGS_LABELS.changePassword}
            </button>
            {passwordDone && (
              <span role="status" className="text-sm text-ink-muted">
                {SETTINGS_LABELS.passwordUpdated}
              </span>
            )}
          </div>
        ) : (
          <form onSubmit={handlePassword} className="flex flex-col gap-4">
            <SettingsField
              name="new_password"
              type="password"
              label={SETTINGS_LABELS.newPassword}
              value={password}
              onChange={setPassword}
            />
            <SettingsField
              name="confirm_new_password"
              type="password"
              label={SETTINGS_LABELS.confirmPassword}
              value={confirmation}
              onChange={setConfirmation}
            />

            {passwordError && (
              <p role="alert" className="text-sm text-danger">
                {passwordError}
              </p>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-pill bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong"
              >
                {SETTINGS_LABELS.updatePassword}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false);
                  setPassword("");
                  setConfirmation("");
                  setPasswordError(null);
                }}
                className="rounded-pill border border-line px-3 py-2 text-sm text-ink"
              >
                {SETTINGS_LABELS.cancel}
              </button>
            </div>
          </form>
        )}
      </section>

      <DeleteAccount />
    </div>
  );
};

export default UserSettings;
