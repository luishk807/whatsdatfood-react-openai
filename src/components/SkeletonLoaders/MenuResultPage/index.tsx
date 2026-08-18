const bar = "animate-pulse rounded bg-surface-sunken";

/**
 * The menu page while it loads.
 *
 * Shaped like what arrives — a header, then rows of square photo tiles — so the
 * page does not jump when the real thing replaces it.
 */
const SkeletonMenuItem = () => (
  <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
    <div className={`h-8 w-1/2 ${bar}`} />

    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }, (_unused, index) => (
        <div key={index} className="flex flex-col gap-2">
          <div className={`aspect-square w-full ${bar}`} />
          <div className={`h-4 w-3/4 ${bar}`} />
          <div className={`h-4 w-1/3 ${bar}`} />
        </div>
      ))}
    </div>
  </div>
);

export default SkeletonMenuItem;
