import { type FC } from "react";
import DeleteAccount from "@/components/DeleteAccount";
import SettingsRow from "@/components/SettingsRow";
import {
  SETTINGS_GROUPS,
  SETTINGS_LABELS_HUB,
} from "@/customConstants/settings";

/**
 * The Settings landing page: a list of places to go, and nothing to fill in.
 *
 * It was one long form - display name, username, email, phone, a password
 * card holding a single button, and a delete-my-account control, all in one
 * scroll with "Save changes" floating between two unrelated sections. Every
 * field looked as important as every other, which on a page containing an
 * irreversible action is the problem rather than a style choice.
 *
 * **Grouped, because the groups are the answer to "where would I look".**
 * Personal is about you, App is about the app's behaviour, Account is the
 * credentials. Somebody hunting for their email finds it under Account
 * without opening anything else, because every row says what is inside it.
 *
 * **Deleting your account is not a setting.** It is last, under its own
 * heading, separated by a rule - not competing with the rows above it and not
 * one mis-tap from a Save button, which is exactly where it used to be.
 */
const SettingsHub: FC = () => (
  <div className="flex w-full max-w-2xl flex-col gap-8">
    {SETTINGS_GROUPS.map((group) => (
      <section key={group.id} className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
          {group.label}
        </h2>

        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line">
          {group.items.map((section) => (
            <li key={section.id}>
              <SettingsRow section={section} />
            </li>
          ))}
        </ul>
      </section>
    ))}

    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {SETTINGS_LABELS_HUB.dangerLabel}
      </h2>

      {/* Its own component, and unchanged: it already asks twice and names
          what it removes rather than saying "are you sure". What changed is
          where it sits. */}
      <DeleteAccount />
    </section>
  </div>
);

export default SettingsHub;
