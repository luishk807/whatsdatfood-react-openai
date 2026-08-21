import { type FC } from "react";
import { SETTINGS_LABELS } from "@/customConstants/labels";

/**
 * Nothing yet, and the page says so.
 *
 * Reachable by typing the URL and by nothing else - the row on the Settings
 * list is inert, because a row that navigates to an empty page reads as
 * broken while one marked "Soon" reads as planned. This exists so the address
 * is not a dead end for anybody who reaches it anyway.
 *
 * There is no notification backend at all: no subscription table, no
 * delivery, no preference column. Building one to fill a settings row is the
 * wrong order to do things in.
 */
const SettingsNotifications: FC = () => (
  <p className="max-w-xl text-sm text-ink-muted">
    {SETTINGS_LABELS.notificationsBlurb}
  </p>
);

export default SettingsNotifications;
