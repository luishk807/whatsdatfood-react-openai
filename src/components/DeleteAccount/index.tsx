import { type FC, useState } from "react";
import useDeleteAccount from "@/customHooks/useDeleteAccount";
import { ACCOUNT_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

/**
 * Deleting the account, for real.
 *
 * Two steps, not one. This is the only irreversible control in the product —
 * it removes the account, every review and vote, and the photographs the person
 * uploaded, and none of it comes back. A single button sitting under a settings
 * form is a button somebody presses while meaning to press Save.
 *
 * The second step names the consequences rather than asking "are you sure?",
 * because "are you sure" tells a reader nothing they did not already know.
 */
const DeleteAccount: FC = () => {
  const [confirming, setConfirming] = useState(false);
  const { deleteAccount, deleting, error } = useDeleteAccount();

  const handleDelete = async () => {
    if (await deleteAccount()) {
      // A full page load, not a client-side navigation.
      //
      // Every cache, context and query in this tab describes a user who no
      // longer exists, and unwinding them in the right order is a race nobody
      // should have to win: clearing the Apollo store empties the auth query,
      // the guard on this route notices before any navigation lands, and the
      // person who just deleted their account is shown a sign-in form. Starting
      // the app again from nothing is both simpler and honest about what
      // happened.
      window.location.replace(ROUTES.home);
    }
  };

  return (
    <section className="mt-10 flex flex-col items-start gap-3 border-t border-line pt-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-ink">
          {ACCOUNT_LABELS.deleteTitle}
        </h2>
        <p className="max-w-prose text-sm text-ink-muted">
          {ACCOUNT_LABELS.deleteBlurb}
        </p>
      </div>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-full border border-danger px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger hover:text-white"
        >
          {ACCOUNT_LABELS.deleteCta}
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-card bg-surface-sunken p-4">
          <p className="max-w-prose text-sm font-medium text-ink">
            {ACCOUNT_LABELS.deleteConfirm}
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {ACCOUNT_LABELS.deleteConsequences.map((line) => (
              <li key={line} className="text-sm text-ink-muted">
                {line}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={handleDelete}
              className="rounded-full bg-danger px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {deleting
                ? ACCOUNT_LABELS.deleting
                : ACCOUNT_LABELS.deleteConfirmCta}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirming(false)}
              className="rounded-full border border-line px-3 py-1.5 text-sm text-ink disabled:opacity-60"
            >
              {ACCOUNT_LABELS.deleteCancel}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {ACCOUNT_LABELS.deleteFailed}
        </p>
      )}
    </section>
  );
};

export default DeleteAccount;
