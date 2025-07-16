import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import { useState } from "react";
import { Box } from "@mui/material";

const RatingComponent = () => {
  const [value, setValue] = useState<number | null>(2);
  const [hover, setHover] = useState(-1);
  const labels: { [index: string]: string } = {
    0.5: "Useless",
    1: "Useless+",
    1.5: "Poor",
    2: "Poor+",
    2.5: "Ok",
    3: "Ok+",
    3.5: "Good",
    4: "Good+",
    4.5: "Excellent",
    5: "Excellent+",
  };

  function getLabelText(value: number) {
    return `${value} Star${value !== 1 ? "s" : ""}, ${labels[value]}`;
  }

  return (
    <Box>
      <Rating
        name="hover-feedback"
        value={5}
        precision={0.5}
        getLabelText={getLabelText}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
    </Box>
  );
};

export default RatingComponent;
