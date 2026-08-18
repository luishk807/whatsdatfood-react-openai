const bar = "animate-pulse rounded bg-surface-sunken";

const SkeletonRatingCreate = () => (
  <div className="my-2.5 flex w-full flex-col gap-2.5">
    <div className="flex justify-between">
      <div className={`h-8 w-1/3 ${bar}`} />
      <div className={`h-8 w-1/3 ${bar}`} />
    </div>
    <div className={`h-8 w-5/12 ${bar}`} />
    <div className={`h-36 w-full ${bar}`} />
  </div>
);

export default SkeletonRatingCreate;
