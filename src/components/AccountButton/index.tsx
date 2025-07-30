import { useEffect, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import "./index.css";
import { Link } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";
import { _get } from "@/utils";
import { dropDownMenuItemType } from "@/interfaces";

import { dropDownMenuListType, dropDownMenuKeyType } from "@/types";

import { DROPDOWN_MENU, ACCOUNT_TYPE } from "@/customConstants";

const AccountButton = () => {
  const { user } = useAuth();
  const [dropDownMenus, setDropDownMenus] = useState<
    dropDownMenuItemType[] | null
  >(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const toggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const DropDownMenuList: dropDownMenuListType = DROPDOWN_MENU;

  const getMenuType = (role: dropDownMenuKeyType) => {
    console.log("role", role);
    if (DropDownMenuList[role]) {
      setDropDownMenus(DropDownMenuList[role]);
    }
  };

  useEffect(() => {
    if (user) {
      const role: string = _get(user, "role_id", "");
      if (role) {
        getMenuType(role as keyof dropDownMenuListType);
      }
    } else {
      getMenuType(ACCOUNT_TYPE.guest);
    }
  }, [user]);

  return (
    <>
      <IconButton onClick={toggleMenu} size="medium">
        <AccountCircleRoundedIcon />
      </IconButton>
      <Menu
        id="account-dropdown-menu"
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              border: "2px solid #ccc", // <-- add this line
              borderRadius: 1, // optional, to round the corners
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: -1,
                left: "calc(65% - 5px)", // centers the arrow
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                borderLeft: "2px solid #ccc",
                borderTop: "2px solid #ccc",
                zIndex: 1,
              },
            },
          },
        }}
      >
        {dropDownMenus &&
          dropDownMenus.map((item, indx) => (
            <MenuItem
              key={indx}
              component={Link}
              className="dropdown-link"
              to={item.url}
            >
              {item.name}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

export default AccountButton;
