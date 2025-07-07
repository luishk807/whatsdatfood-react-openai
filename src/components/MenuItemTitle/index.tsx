import StarRoundedIcon from "@mui/icons-material/StarRounded";
interface MenuItemItem {
  name: string;
  top_choice: boolean;
}

const MenuItemTitle = ({ top_choice, name }: MenuItemItem) => {
  return (
    <>
      {name}
      {top_choice && <StarRoundedIcon />}
    </>
  );
};

export default MenuItemTitle;
