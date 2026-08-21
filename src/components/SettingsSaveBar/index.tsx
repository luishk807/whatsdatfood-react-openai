import { type FC } from "react";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { SettingsSaveBarInterface } from "@/interfaces/settings";

/**
 * Save, for the form it belongs to.
 *
 * **At the bottom of its own form, never between two.** The old page had one
 * "Save changes" sitting between the Account card and the Password card,
 * belonging to neither by position and to both by appearance - so it was
 * unclear what pressing it would send.
 *
 * **Disabled until something changes**, compared against what was loaded
 * rather than a flag, so typing an edit and typing it back correctly disables
 * it again. It was always enabled before, which meant pressing it on an
 * untouched page sent a mutation that changed nothing.
 *
 * **Sticky on a phone, and only while there is something to save.** A bar
 * pinned to the bottom of a short form permanently is a bar covering the
 * form; one that appears when it has a job is a prompt.
 */
const SettingsSaveBar: FC<SettingsSaveBarInterface> = ({
  canSave,
  saving,
  state,
  onSave,
}) => (
  <div
    className={
      canSave || saving
        ? "sticky bottom-0 -mx-4 mt-2 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-none"
        : "mt-2"
    }
  >
    <div className="flex items-center gap-3">
      <button
        type="submit"
        onClick={onSave}
        disabled={!canSave}
        className="min-h-11 rounded-pill bg-brand px-5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-50"
      >
        {saving ? SETTINGS_LABELS.saving : SETTINGS_LABELS.save}
      </button>

      {state === "saved" && (
        <span role="status" className="text-sm text-ink-muted">
          {SETTINGS_LABELS.saved}
        </span>
      )}

      {/* The form keeps what was typed - this says what happened, it does not
          ask anybody to retype an email they just lost a connection over. */}
      {state === "failed" && (
        <span role="alert" className="text-sm text-danger">
          {SETTINGS_LABELS.saveFailed}
        </span>
      )}
    </div>
  </div>
);

export default SettingsSaveBar;
