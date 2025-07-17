import { Box, Grid } from "@mui/material";
import FormComponent from "../FormComponent";
import { FormFieldType } from "@/types";
import "./index.css";
import { CREATE_ACCOUNT } from "@/customConstants/forms";
import { Link } from "react-router-dom";
const CreateAccount = () => {
  const handleSubmit = (formData: any) => {
    console.log("form data", formData);
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
    </Box>
  );
};

export default CreateAccount;
