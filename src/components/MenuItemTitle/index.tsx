import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RatingComponent from "../Rating";
interface MenuItemItem {
  name: string;
  top_choice: boolean;
}

const MenuItemTitle = ({ top_choice, name }: MenuItemItem) => {
  const ratingChanged = () => {};
  return (
    <>
      {name}
      {top_choice && <LocalFireDepartmentIcon style={{ fill: "red" }} />}
      <RatingComponent />
    </>
  );
};

export default MenuItemTitle;
