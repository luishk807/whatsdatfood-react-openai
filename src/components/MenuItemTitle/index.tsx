import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { MenuItemType } from "@/interfaces/restaurants";
const LazyRatingLIst = lazy(() => import("@/components/RatingModalList"));
import { lazy } from "react";
interface MenuItemItem {
  data: MenuItemType;
}

const MenuItemTitle = ({ data }: MenuItemItem) => {
  const ratingChanged = () => {};
  return (
    <>
      {data.name}
      {data.top_choice && <LocalFireDepartmentIcon style={{ fill: "red" }} />}
      <LazyRatingLIst data={data} />
    </>
  );
};

export default MenuItemTitle;
