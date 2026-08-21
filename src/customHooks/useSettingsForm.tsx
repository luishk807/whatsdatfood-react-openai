import { useCallback, useMemo, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "failed";

/**
 * One settings form: what changed, whether it can be saved, and what happened.
 *
 * **Save belongs to a form, not to a page.** The old settings page had a
 * single "Save changes" button floating between the Account card and the
 * Password card, belonging to neither by position and to both by appearance.
 * It was also always enabled, so pressing it on an untouched page sent a
 * mutation that changed nothing.
 *
 * **Dirty is compared against what was loaded**, not tracked as a flag, so
 * typing a change and typing it back leaves the button disabled - which is
 * the truth. A flag would say there is something to save when there is not.
 *
 * **A failed save keeps what was typed.** This never resets the form on
 * error: somebody who just typed a new email and lost their connection must
 * not also lose the email. The values stay, the error says what happened, and
 * pressing save again is the whole recovery.
 */
const useSettingsForm = <T extends Record<string, string>>(
  initial: T,
  save: (values: T) => Promise<unknown>,
) => {
  const [loaded, setLoaded] = useState<T>(initial);
  const [values, setValues] = useState<T>(initial);
  const [state, setState] = useState<SaveState>("idle");

  /** Fill the form from the server, and make that the new baseline. */
  const reset = useCallback((next: T) => {
    setLoaded(next);
    setValues(next);
    setState("idle");
  }, []);

  const set = useCallback(
    (key: keyof T) => (value: string) => {
      // Any edit clears a stale "Saved." - leaving it up beside a changed
      // field claims the change is stored when it is not.
      setState((current) => (current === "idle" ? current : "idle"));
      setValues((previous) => ({ ...previous, [key]: value }));
    },
    [],
  );

  const dirty = useMemo(
    () => Object.keys(loaded).some((key) => loaded[key] !== values[key]),
    [loaded, values],
  );

  const submit = useCallback(async () => {
    if (!dirty || state === "saving") {
      return;
    }

    setState("saving");

    try {
      await save(values);
      // The saved values become the baseline, so the button disables again
      // without a refetch and without clearing the form.
      setLoaded(values);
      setState("saved");
    } catch {
      // Deliberately nothing else. `values` is untouched, so the form still
      // holds what was typed.
      setState("failed");
    }
  }, [dirty, save, state, values]);

  return {
    values,
    set,
    reset,
    submit,
    dirty,
    state,
    saving: state === "saving",
    /** Enabled only when there is something to save. */
    canSave: dirty && state !== "saving",
  };
};

export default useSettingsForm;
