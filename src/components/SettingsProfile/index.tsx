import { type FC, type FormEvent, useEffect } from "react";
import SettingsField from "@/components/SettingsField";
import SettingsSaveBar from "@/components/SettingsSaveBar";
import useSettingsForm from "@/customHooks/useSettingsForm";
import useUser from "@/customHooks/useUser";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { UserType } from "@/interfaces/users";
import { displayName } from "@/utils/people";

/**
 * What other people see: the name on your photos, and your handle.
 *
 * Split out of the old single page, which mixed this with an email field, a
 * phone field, a password card and a delete button - so "how you appear to
 * other people" sat two inches above the most private thing in the product.
 * Those are now a separate section, because they are a separate question.
 *
 * **The photo slot is declared and says so.** There is no avatar column and
 * no upload endpoint, and inventing both to fill a row is unnecessary backend
 * work. The space is here, labelled, saying it is not available yet - which
 * is honest and makes adding it later a component swap.
 */
const SettingsProfile: FC = () => {
  const { getUserInfo, updateUser } = useUser();

  const form = useSettingsForm(
    { display_name: "", username: "" },
    (values) => updateUser(values),
  );

  const { reset } = form;

  useEffect(() => {
    let live = true;

    getUserInfo().then((resp) => {
      const user = resp as UserType | undefined;

      if (!live || !user) {
        return;
      }

      reset({
        // Falls back to the legacy name parts, so an account created before
        // the column existed shows its owner's name rather than a blank box
        // that would wipe it on the next save.
        display_name: displayName(user),
        username: user.username ?? "",
      });
    });

    return () => {
      live = false;
    };
    // Once, on mount. `getUserInfo` is a fresh identity on every render, and a
    // fresh identity in a dependency list is how this codebase has produced a
    // request loop three times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    form.submit();
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-xl flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">
          {SETTINGS_LABELS.photoTitle}
        </h2>

        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="h-16 w-16 shrink-0 rounded-full bg-surface-sunken"
          />
          <p className="text-sm text-ink-muted">{SETTINGS_LABELS.photoSoon}</p>
        </div>
      </section>

      <SettingsField
        name="display_name"
        label={SETTINGS_LABELS.displayName}
        hint={SETTINGS_LABELS.displayNameHint}
        value={form.values.display_name}
        onChange={form.set("display_name")}
      />

      {/* Signup derives a handle so nobody has to invent one at the door.
          This is the first time most people see theirs. */}
      <SettingsField
        name="username"
        label={SETTINGS_LABELS.username}
        hint={SETTINGS_LABELS.usernameHint}
        value={form.values.username}
        onChange={form.set("username")}
      />

      <SettingsSaveBar
        canSave={form.canSave}
        saving={form.saving}
        state={form.state}
        onSave={form.submit}
      />
    </form>
  );
};

export default SettingsProfile;
