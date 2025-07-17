import { Box, Grid } from "@mui/material";
import FormComponent from "../FormComponent";
import { FormFieldType } from "@/types";
import "./index.css";
import { SIGN_IN_FIELDS } from "@/customConstants/forms";
import { Link } from "react-router-dom";
const SignInComponent = () => {
  const handleSubmit = (formData: any) => {
    console.log("form data", formData);
  };

  const formFields: FormFieldType[] = SIGN_IN_FIELDS;

  return (
    <Box id="signin-component-container">
      <Box className="form-container">
        <FormComponent
          fields={formFields}
          title="Sign In"
          submitLabel="Login"
          onHandleSubmit={handleSubmit}
        />
        <Grid container>
          <Grid size={12}>
            <Link to="/" className="link-text">
              Forgot password?
            </Link>
          </Grid>
          <Grid size={12} style={{ marginTop: "10px" }}>
            New User?{" "}
            <Link className="link-text link-bold" to="/create-account">
              Get Access
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SignInComponent;
