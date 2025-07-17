import { Box, Grid } from "@mui/material";
import FormComponent from "@/components/FormComponent";
import { FormFieldType, snackBarObjType } from "@/types";
import { addUser } from "@/api/users";
import "./index.css";
import SnackBarComponent from "@/components/Snackbar";
import { CREATE_ACCOUNT } from "@/customConstants/forms";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [snackbarObj, setSnakbarObj] = useState<snackBarObjType>({
    open: false,
    message: "account created",
    severity: "success",
  });

  const handleSubmit = async (formData: any) => {
    const { confirm_password: _, ...payload } = formData;
    console.log(payload);

    try {
      await addUser(payload);
      setSnakbarObj({
        ...snackbarObj,
        open: true,
      });

      setTimeout(() => {
        navigate("/sign-in");
      }, 2000);
    } catch (err) {
      setSnakbarObj({
        open: true,
        message: "unable to create account",
        severity: "error",
      });
    }
  };

  const formFields: FormFieldType[] = CREATE_ACCOUNT;

  return (
    <Box
      id="create-account-component-container"
      sx={{
        margin: {
          md: "0px",
          xs: "10px",
        },
      }}
    >
      <Box className="form-container">
        <FormComponent
          fields={formFields}
          title="Create Account"
          submitLabel="Register"
          onHandleSubmit={handleSubmit}
        />
        <Grid container>
          <Grid size={12} className="flex justify-start">
            <Link to="/" className="link-text">
              Back to Login
            </Link>
          </Grid>
        </Grid>
      </Box>
      <SnackBarComponent
        open={snackbarObj.open}
        severity={snackbarObj.severity}
        onClose={() =>
          setSnakbarObj({
            ...snackbarObj,
            open: false,
          })
        }
        message={snackbarObj.message}
      />
    </Box>
  );
};

export default CreateAccount;
