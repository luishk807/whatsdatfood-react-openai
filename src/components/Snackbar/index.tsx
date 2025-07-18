import Snackbar from "@mui/material/Snackbar";
import Alert, { AlertColor } from "@mui/material/Alert";
import { type FC } from "react";

interface SnackBarComponentInterface {
  message: string;
  severity?: AlertColor;
  open: boolean;
  onClose: () => void;
}
const SnackBarComponent: FC<SnackBarComponentInterface> = ({
  message,
  severity = "success",
  open,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBarComponent;
