import { useState, useEffect, type FC, useMemo, useRef } from "react";
import { CustomModalInterface } from "@/interfaces";
import Button from "@/components/Button";
import { Link } from "react-router-dom";
import { CloseIcon } from "@/components/icons";

/**
 * The generic dialog. Full screen on a phone, a centred card from `lg` up —
 * which is what the MUI `sx` breakpoint object it replaced was expressing.
 */
const CustomModal: FC<CustomModalInterface> = ({
  children,
  label,
  type,
  customButton,
  closeOnParent,
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const toggleModal = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setOpen((prev) => !prev);
  };

  const determineType = useMemo(() => {
    return customButton ? "custom" : type || "button";
  }, [customButton, type]);

  const ModalButton = useMemo(() => {
    switch (determineType) {
      case "text":
      case "link":
        return <Link to="/">{label || "link label"}</Link>;
      case "custom":
        return (
          <div
            role="button"
            tabIndex={0}
            onClick={toggleModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggleModal(e);
            }}
          >
            {customButton}
          </div>
        );
      default:
        return <Button onClick={toggleModal}>{label}</Button>;
    }
  }, [determineType, customButton, label]);

  useEffect(() => {
    if (closeOnParent) {
      setOpen(false);
    }
  }, [closeOnParent]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
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
  }, [open]);

  return (
    <>
      {ModalButton}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            tabIndex={-1}
            className="relative z-10 h-screen w-full overflow-y-auto border border-line bg-surface-raised text-ink shadow-tile outline-none lg:h-auto lg:max-h-[85vh] lg:min-h-[200px] lg:w-[500px] lg:rounded-[10px] lg:p-5"
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-ink-muted hover:text-ink"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

export default CustomModal;
