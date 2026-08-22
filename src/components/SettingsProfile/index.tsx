import { type FC, type FormEvent, useEffect, useRef, useState } from "react";
import SettingsField from "@/components/SettingsField";
import SettingsSaveBar from "@/components/SettingsSaveBar";
import useSettingsForm from "@/customHooks/useSettingsForm";
import useAvatarUpload from "@/customHooks/useAvatarUpload";
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
 * **The photo goes through the same pipe as a dish photograph.**
 * `prepareUpload` resizes and square-crops in the browser before anything is
 * sent, and the server processes and screens it exactly as it does food. A
 * second image path would be a second place to forget to strip EXIF and a
 * second thing to move when storage does.
 *
 * **No photograph shows initials, not a silhouette.** Most people have none,
 * and a grey outline of a head on every account reads as something missing
 * rather than something optional.
 */
const SettingsProfile: FC = () => {
  const { getUserInfo, updateUser } = useUser();
  const {
    upload: uploadAvatar,
    uploading,
    error: uploadError,
  } = useAvatarUpload();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

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

      setAvatar(user.avatar_url ?? null);
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

  // From the display name, which is what every other renderer falls back
  // to as well.
  const initials = (form.values.display_name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

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

        <div className="flex items-center gap-4">
          {/* Initials rather than a silhouette when there is no photograph:
              most people have none, and a grey outline of a head on every
              account reads as something missing. */}
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-lg font-medium text-ink-muted"
            >
              {initials}
            </span>
          )}

          <div className="flex flex-col gap-1">
            {/* One hidden input, and the value is cleared after every pick so
                choosing the same file twice still fires a change. Four copies
                of that is how an upload control quietly stops working. */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";

                if (!file) {
                  return;
                }

                const url = await uploadAvatar(file);

                if (url) {
                  setAvatar(url);
                }
              }}
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="min-h-11 self-start rounded-pill border border-line px-4 text-sm text-ink hover:border-ink disabled:opacity-60"
            >
              {uploading
                ? SETTINGS_LABELS.photoUploading
                : avatar
                  ? SETTINGS_LABELS.photoChange
                  : SETTINGS_LABELS.photoAdd}
            </button>

            <p className="text-xs text-ink-muted">
              {SETTINGS_LABELS.photoHint}
            </p>

            {uploadError && (
              <p role="alert" className="text-sm text-danger">
                {uploadError}
              </p>
            )}
          </div>
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
