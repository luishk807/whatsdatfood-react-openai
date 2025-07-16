import { Button, ButtonProps } from "@mui/material";
import { type FC } from "react";
import "./index.css";
const CustomButton: FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <Button {...props} variant="outlined" className="item-menu-item-btn">
      {children}
    </Button>
  );
};

export default CustomButton;
