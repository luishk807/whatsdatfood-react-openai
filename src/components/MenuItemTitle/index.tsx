import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
interface MenuItemItem {
  name: string;
  top_choice: boolean;
}

const MenuItemTitle = ({ top_choice, name }: MenuItemItem) => {
  return (
    <>
      {name}
      {top_choice && <LocalFireDepartmentIcon style={{ fill: "red" }} />}
    </>
  );
};

export default MenuItemTitle;
