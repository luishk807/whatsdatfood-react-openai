import { type FC, type FormEvent, useEffect, useState } from "react";
import SettingsField from "@/components/SettingsField";
import SettingsSaveBar from "@/components/SettingsSaveBar";
import useSettingsForm from "@/customHooks/useSettingsForm";
import useUser from "@/customHooks/useUser";
import { ACCOUNT } from "@/customConstants/account";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { UserType } from "@/interfaces/users";

/**
 * The credentials: how we reach you, and how you get in.
 *
 * **Password lives here, not on the Settings home.** It used to have a whole
 * card to itself on the landing page, containing one button - a section-sized
 * frame around a link. It is an action rather than a field, so it stays behind
 * a button until it is asked for, and that button belongs beside the email
 * address it protects.
 *
 * **Two forms, two saves.** Changing an email and changing a password are
 * different decisions with different consequences, and the old page's single
 * floating Save sat between them belonging to neither.
 */
const SettingsAccount: FC = () => {
  const { getUserInfo, updateUser } = useUser();

  const form = useSettingsForm(
    { email: "", phone: "" },
    (values) => updateUser(values),
  );

  const { reset } = form;

  const [changing, setChanging] = useState(false);
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

      reset({ email: user.email ?? "", phone: user.phone ?? "" });
    });

    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.submit();
  };

  const onPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordDone(false);

    // Checked here so the common mistakes cost no round trip. The server
    // enforces the length too, and it is the one that decides.
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
      setChanging(false);
      setPasswordDone(true);
    } catch {
      setPasswordError(SETTINGS_LABELS.saveFailed);
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <p className="text-sm text-ink-muted">
          {SETTINGS_LABELS.accountPrivate}
        </p>

        <SettingsField
          name="email"
          type="email"
          label={SETTINGS_LABELS.email}
          value={form.values.email}
          onChange={form.set("email")}
        />
        <SettingsField
          name="phone"
          type="tel"
          label={SETTINGS_LABELS.phone}
          value={form.values.phone}
          onChange={form.set("phone")}
        />

        <SettingsSaveBar
          canSave={form.canSave}
          saving={form.saving}
          state={form.state}
          onSave={form.submit}
        />
      </form>

      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <h2 className="text-sm font-medium text-ink">
          {SETTINGS_LABELS.passwordTitle}
        </h2>

        {!changing ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setChanging(true)}
              className="min-h-11 self-start rounded-pill border border-line px-4 text-sm text-ink hover:border-ink"
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
          <form onSubmit={onPassword} className="flex flex-col gap-4">
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
                className="min-h-11 rounded-pill bg-brand px-5 text-sm font-medium text-white hover:bg-brand-strong"
              >
                {SETTINGS_LABELS.updatePassword}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChanging(false);
                  setPassword("");
                  setConfirmation("");
                  setPasswordError(null);
                }}
                className="min-h-11 rounded-pill border border-line px-4 text-sm text-ink"
              >
                {SETTINGS_LABELS.cancel}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};

export default SettingsAccount;
