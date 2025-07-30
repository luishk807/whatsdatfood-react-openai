import { Box, Skeleton } from "@mui/material";
const FormTextfieldSkeleton = () => {
  return (
    <Box
      sx={{
        width: "100%",
        margin: "10px 0px",
      }}
    >
      <Skeleton animation="wave" height={5} width="35%" />
      <Skeleton animation="wave" height={20} width="100%" />
    </Box>
  );
};

export default FormTextfieldSkeleton;
