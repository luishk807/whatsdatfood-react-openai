import { FC, useEffect, useRef } from "react";
import { CloseIcon } from "@/components/icons";
import { BottomSheetInterface } from "@/interfaces/ui";

/**
 * Detail opens over the grid rather than navigating away, so the reader keeps
 * their place in the menu. It rises from the bottom on a phone — within thumb
 * reach — and becomes a centred dialog on wider screens.
 */
const BottomSheet: FC<BottomSheetInterface> = ({
  open,
  title,
  onClose,
  children,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-card bg-surface-raised p-4 shadow-sheet outline-none sm:max-w-lg sm:rounded-card"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          {title && (
            <h2 className="text-base font-semibold text-ink">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-ink-muted hover:text-ink"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
