import { Box, Skeleton } from "@mui/material";
const FormRatingSkeleton = () => {
  return (
    <Box
      sx={{
        width: "100%",
        margin: "10px 0px",
      }}
    >
      <Skeleton animation="wave" height={5} width="50%" />
    </Box>
  );
};

export default FormRatingSkeleton;
