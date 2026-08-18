import { type ButtonHTMLAttributes, type FC } from "react";
import clsx from "clsx";

/**
 * The form button. Was a MUI `Button variant="outlined"` styled back down by a
 * stylesheet that fought it; this is the same look with none of the runtime.
 */
const CustomButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className,
  type = "button",
  ...props
}) => {
  return (
    <button
      {...props}
      type={type}
      className={clsx(
        "mb-[5px] w-full rounded-md border border-line px-4 py-2 text-sm font-medium uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-surface disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </button>
  );
};

export default CustomButton;
