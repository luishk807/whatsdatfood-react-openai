import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { MenuItemItem } from "@/interfaces/restaurants";
import { lazy, Suspense } from "react";
import { RATING_TYPE } from "@/customConstants";
import RectangleSkeleton from "@/components/SkeletonLoaders/Rectangle";
const LazyRatingLIst = lazy(() => import("@/components/RatingModalList"));

const MenuItemTitle = ({ data }: MenuItemItem) => {
  return (
    <>
      {data.name}
      {data.top_choice && <LocalFireDepartmentIcon style={{ fill: "red" }} />}
      <Suspense fallback={<RectangleSkeleton />}>
        <LazyRatingLIst data={data} defaultType={RATING_TYPE.list} />
      </Suspense>
    </>
  );
};

export default MenuItemTitle;
