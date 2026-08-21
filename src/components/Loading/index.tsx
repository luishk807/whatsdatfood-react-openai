import { FC, useMemo } from "react";
import { LOADING_TYPES } from "@/customConstants";
import { LoadingInterface } from "@/interfaces";

/**
 * Was MUI's CircularProgress: a ring with one quarter left transparent.
 *
 * Drawn in CSS at both sizes, because the alternative was an animated GIF -
 * a network request for a spinner, which cannot take the theme and cannot
 * stop moving for somebody who asked for less motion.
 */
const Ring: FC<{ small?: boolean }> = ({ small }) => (
  <span
    role="progressbar"
    aria-label="Loading"
    className={
      small
        ? "inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand motion-reduce:animate-none"
        : "inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-line border-t-brand motion-reduce:animate-none"
    }
  />
);

const Circular: FC = () => <Ring />;

/** The inline one, sized to sit inside a text field rather than beside it. */
const Small: FC = () => <Ring small />;

/** Was MUI's LinearProgress. Indeterminate, so it carries no false progress. */
const Linear: FC = () => (
  <span
    role="progressbar"
    aria-label="Loading"
    className="block h-1 w-full overflow-hidden rounded-full bg-surface-sunken"
  >
    <span className="block h-full w-1/3 animate-pulse rounded-full bg-brand motion-reduce:animate-none" />
  </span>
);

const Loading = ({
  style,
  type = LOADING_TYPES.SPINER,
  customLoader: CustomComponent,
}: LoadingInterface) => {
  const LoadingContainer: FC = useMemo(() => {
    switch (type) {
      case LOADING_TYPES.LINEAR:
        return Linear;
      case LOADING_TYPES.CIRCULAR:
        return Circular;
      case LOADING_TYPES.CUSTOM:
        return () => (CustomComponent ? <CustomComponent /> : null);
      default:
        // `SPINER` - the historical default, and an inline-sized ring rather
        // than the GIF it used to be.
        return Small;
    }
  }, [type]);

  return (
    <div
      style={style}
      className="flex min-h-[20px] w-full items-center justify-center"
    >
      <div className="flex h-full w-full justify-center text-center">
        <LoadingContainer />
      </div>
    </div>
  );
};

export default Loading;
