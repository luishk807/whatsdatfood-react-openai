import { type FC } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@/components/icons";
import { SETTINGS_LABELS_HUB } from "@/customConstants/settings";
import { SettingsRowInterface } from "@/interfaces/settings";

/**
 * One line on the Settings list: a title, what is inside, and a chevron.
 *
 * **Compact and tappable.** 56px minimum, the whole row is the target, and
 * the blurb says what is behind it so nobody has to open three sections to
 * find the one holding their email.
 *
 * **An unavailable section is a row, not a link.** It renders greyed with a
 * "Soon" pill and does not navigate. A row that opened an empty page would
 * read as broken; this reads as planned, which is the truth. Same call as the
 * absent "Continue with Google" button and the disabled verification methods.
 */
const SettingsRow: FC<SettingsRowInterface> = ({ section }) => {
  const inside = (
    <>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-medium text-ink">{section.label}</span>
        <span className="truncate text-xs text-ink-muted">{section.blurb}</span>
      </span>

      {section.available ? (
        <ChevronRightIcon size={18} className="shrink-0 text-ink-muted" />
      ) : (
        <span className="shrink-0 rounded-pill border border-line px-2 py-0.5 text-[11px] text-ink-muted">
          {SETTINGS_LABELS_HUB.soon}
        </span>
      )}
    </>
  );

  const shared =
    "flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left";

  if (!section.available) {
    return (
      <div aria-disabled="true" className={`${shared} opacity-60`}>
        {inside}
      </div>
    );
  }

  return (
    <Link to={section.route} className={`${shared} hover:bg-surface-sunken`}>
      {inside}
    </Link>
  );
};

export default SettingsRow;
