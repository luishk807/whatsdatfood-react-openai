import { Box, Grid } from "@mui/material";
import FormComponent from "@/components/FormComponent";
import { FormFieldType } from "@/interfaces";
import "./index.css";
import { SIGN_IN_FIELDS } from "@/customConstants/forms";
import { Link } from "react-router-dom";
// import { login } from "@/api/login";
import { useNavigate } from "react-router-dom";
import useAuth from "@/customHooks/useAuth";

import useSnackbarHook from "@/customHooks/useSnackBar";
import useLogin from "@/customHooks/useLogin";
const SignInComponent = () => {
  const { SnackbarComponent, showSnackBar } = useSnackbarHook();
  const navigator = useNavigate();
  const { login } = useLogin();
  const { checkUser } = useAuth();

  const handleSubmit = async (formData: any) => {
    console.log("form data", formData);
    try {
      const { username, password } = formData;
      const resp = await login(username, password);

      if (resp) {
        checkUser();
        showSnackBar("SUCCESS: You are logged in!", "success");
        setTimeout(() => {
          navigator("/");
        }, 2000);
      } else {
        showSnackBar("ERROR: unable to log in!", "error");
      }
    } catch (err) {
      showSnackBar("ERROR: unable to log in!", "error");
    }
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
      {SnackbarComponent}
    </Box>
  );
};

export default SignInComponent;
