import { NoPhotographyIcon } from "@/components/icons";

const NoImage = () => {
  return (
    <div className="flex h-[150px] w-[150px] items-center justify-center">
      <NoPhotographyIcon size={75} className="text-ink-muted opacity-30" />
    </div>
  );
};

export default NoImage;
