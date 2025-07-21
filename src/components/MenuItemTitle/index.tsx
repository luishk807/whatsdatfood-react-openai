import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RatingComponent from "../RatingModal";
import { MenuItemType } from "@/types/restaurants";
interface MenuItemItem {
  data: MenuItemType;
}

const MenuItemTitle = ({ data }: MenuItemItem) => {
  const ratingChanged = () => {};
  return (
    <>
      {data.name}
      {data.top_choice && <LocalFireDepartmentIcon style={{ fill: "red" }} />}
      <RatingComponent data={data} />
    </>
  );
};

export default MenuItemTitle;
