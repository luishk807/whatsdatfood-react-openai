import IconButton from "@mui/material/IconButton";
import { ReactNode, type FC } from "react";
import { Link } from "react-router-dom";

interface IconLinkButtonInt {
  children: ReactNode;
  to: string;
}
const IconLinkButton: FC<IconLinkButtonInt> = ({ children, to }) => {
  return (
    <IconButton component={Link} to={to}>
      {children}
    </IconButton>
  );
};

export default IconLinkButton;
