import { type FC } from "react";
import clsx from "clsx";
import { SnackBarComponentInterface } from "@/interfaces/ui";
import { SEVERITY } from "@/customConstants";
import { SeverityType } from "@/types";
import { CloseIcon } from "@/components/icons";

/**
 * Top-centre toast. `danger` and `warn` are the existing tokens; success uses
 * `brand` because it is already the "this worked" colour everywhere else.
 */
const TONE: Record<SeverityType, string> = {
  [SEVERITY.success]: "bg-brand text-white",
  [SEVERITY.info]: "bg-ink text-surface",
  [SEVERITY.warning]: "bg-warn text-ink",
  [SEVERITY.error]: "bg-danger text-white",
};

const SnackBarComponent: FC<SnackBarComponentInterface> = ({
  message,
  severity = SEVERITY.success,
  open,
  onClose,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed left-1/2 top-4 z-[60] w-[min(92vw,32rem)] -translate-x-1/2"
    >
      <div
        className={clsx(
          "flex items-center justify-between gap-3 rounded-card px-4 py-3 text-sm shadow-sheet",
          TONE[severity],
        )}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 rounded-full p-0.5 opacity-80 hover:opacity-100"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
};

export default SnackBarComponent;
