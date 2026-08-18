/** A line-shaped placeholder. Tailwind's pulse, not MUI's Skeleton. */
const RectangleSkeleton = () => (
  <div className="my-2.5 w-full">
    <div className="h-2.5 w-full animate-pulse rounded bg-surface-sunken" />
  </div>
);

export default RectangleSkeleton;
