import { Grid, Box, Skeleton } from "@mui/material";
const SkeletonMenuItem = () => {
  const rows = Array.from({ length: 3 });
  return (
    <Grid className="w-full">
      <Box className="w-full">
        <Skeleton width="50%" className="m-auto" height={150} />
      </Box>
      <Box className="w-full">
        {/* category title section */}
        <Box>
          <Skeleton
            style={{ marginBottom: "16px" }}
            animation="wave"
            variant="rectangular"
            height={30}
          />
        </Box>
        <Box
          sx={{
            padding: "10px",
            width: "100%",
          }}
        >
          {rows.map((_, index) => {
            return (
              <Box
                sx={{
                  marginBottom: "5px",
                }}
                key={index}
                className="flex"
                width="100%"
              >
                {/* image section */}
                <Box
                  className="flex h-full"
                  sx={{
                    width: {
                      md: "20%",
                      xs: "40%",
                    },
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    style={{
                      display: "flex",
                      justifyContent: "start",
                    }}
                    height={150}
                    width="100%"
                  />
                </Box>
                {/* content section */}
                <Box className="flex flex-col  w-4/5">
                  <Box className="flex mb-7 w-full">
                    <Skeleton
                      variant="rectangular"
                      className="mx-auto"
                      height={20}
                      width="50%"
                    />
                  </Box>
                  <Box className="flex mt-6 w-full h-full justify-center flex">
                    <Skeleton
                      style={{ marginTop: "5px" }}
                      variant="rectangular"
                      height="70%"
                      width="80%"
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Grid>
  );
};

export default SkeletonMenuItem;
