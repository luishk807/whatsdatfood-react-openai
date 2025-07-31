import { Box, Grid } from "@mui/material";
import FormComponent from "@/components/FormComponent";
import { FormFieldType } from "@/interfaces";
import { CREATE_ACCOUNT } from "@/customConstants/forms";
import { Link, useNavigate } from "react-router-dom";
import useSnackbarHook from "@/customHooks/useSnackBar";
import useUser from "@/customHooks/useUser";
import "./index.css";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { createUser, submitUserQuery } = useUser();
  const { loading, data } = submitUserQuery;
  const { SnackbarComponent, showSnackBar } = useSnackbarHook();

  const handleSubmit = async (formData: any) => {
    const { confirm_password: _, ...payload } = formData;
    console.log(payload);

    try {
      const resp = await createUser(payload);

      showSnackBar("SUCCESS: Account is created!", "success");

      setTimeout(() => {
        navigate("/sign-in");
      }, 3000);
    } catch (err) {
      console.log("err", err);
      showSnackBar("ERROR: Unable to create account!", "error");
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
          showLoadingSubmit={loading}
        />
        <Grid container>
          <Grid size={12} className="flex justify-start">
            <Link to="/sign-in" className="link-text">
              Back to Login
            </Link>
          </Grid>
        </Grid>
      </Box>
      {SnackbarComponent}
    </Box>
  );
};

export default CreateAccount;
