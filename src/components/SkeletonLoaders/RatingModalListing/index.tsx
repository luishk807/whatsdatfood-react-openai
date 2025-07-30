import { Skeleton } from "@mui/material";
import { Box } from "@mui/material";
const SkeletonRatingListing = () => {
  return (
    <Box className="w-full" sx={{ margin: "10px 0px" }}>
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={30}
            width="35%"
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={30}
            width="35%"
          />
        </Box>

        <Skeleton
          sx={{
            margin: "10px 0px",
          }}
          animation="wave"
          variant="rectangular"
          height={30}
          width="45%"
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          height="150px"
          width="100%"
        />
      </Box>
      <Box sx={{ margin: "10px 0px" }}>
        <Skeleton
          animation="wave"
          variant="rectangular"
          height="5"
          width="100%"
        />
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={30}
            width="35%"
          />
          <Skeleton
            animation="wave"
            variant="rectangular"
            height={30}
            width="35%"
          />
        </Box>

        <Skeleton
          sx={{
            margin: "10px 0px",
          }}
          animation="wave"
          variant="rectangular"
          height={30}
          width="45%"
        />
        <Skeleton
          animation="wave"
          variant="rectangular"
          height={150}
          width="100%"
        />
      </Box>
    </Box>
  );
};

export default SkeletonRatingListing;
