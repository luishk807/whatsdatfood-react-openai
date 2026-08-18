import { FC, useMemo } from "react";
import "./index.css";
import { LOADING_TYPES } from "@/customConstants";
import { LoadingInterface } from "@/interfaces";
import loadingGif from "@/assets/loading.gif";

/** Was MUI's CircularProgress: a ring with one quarter left transparent. */
const Circular: FC = () => (
  <span
    role="progressbar"
    aria-label="Loading"
    className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-line border-t-brand motion-reduce:animate-none"
  />
);

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
        return () => (
          <img className="loading-icon" src={loadingGif} alt="loading" />
        );
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
