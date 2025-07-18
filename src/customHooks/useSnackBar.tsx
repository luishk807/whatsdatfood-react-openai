import { snackBarObjType } from "@/types";
import { AlertColor } from "@mui/material";
import { useCallback, useState } from "react";
import SnackBarCustom from "@/components/Snackbar";
const useSnackbarHook = () => {
  const [snackbarObj, setSnackbarObj] = useState<snackBarObjType>({
    message: "SUCCESS: You are log in",
    severity: "success",
    open: false,
  });

  const showSnackBar = useCallback(
    (message: string, severity: AlertColor = "success") => {
      setSnackbarObj({
        message,
        severity,
        open: true,
      });
    },
    [],
  );

  const closeSnackBar = useCallback(() => {
    setSnackbarObj((prev) => ({ ...prev, open: false }));
  }, []);

  const SnackbarComponent = (
    <SnackBarCustom
      message={snackbarObj.message}
      severity={snackbarObj.severity}
      open={snackbarObj.open}
      onClose={closeSnackBar}
    />
  );

  return { showSnackBar, SnackbarComponent };
};

export default useSnackbarHook;
