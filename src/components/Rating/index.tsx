import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import { Box } from "@mui/material";
import { useState, useEffect, type FC } from "react";
import { RatingCustomInterface } from "@/interfaces/users";

const RatingCustom: FC<RatingCustomInterface> = ({
  isDisplay = false,
  label,
  defaultValue,
  oneStarMode,
  sx,
  onClick,
}) => {
  const [value, setValue] = useState<number | null>(2);
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

  const handleRatingChange = (event: any, newValue: any) => {
    console.log(newValue);
    setValue(newValue);
    onClick && onClick(newValue);
  };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  if (oneStarMode) {
    return (
      <Box component="span" sx={{ ...((sx as object) || {}) }}>
        (
        <StarIcon sx={{ fontSize: "inherti", fill: "orange" }} />
        {defaultValue})
      </Box>
    );
  }
  if (isDisplay) {
    return (
      <div className="flex justify-center flex-row items-center gap-1 cursor-pointer">
        <Rating
          name="hover-feedback"
          value={defaultValue}
          icon={<StarIcon fontSize="inherit" />}
          precision={0.5}
          readOnly
          getLabelText={getLabelText}
          sx={{
            "& .MuiRating-iconActive": {
              transform: "none",
            },
            ...((sx as object) || {}),
          }}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        />
        <Box>({defaultValue})</Box>
      </div>
    );
  }
  return (
    <>
      {label && label}
      <Rating
        name="hover-feedback"
        value={value}
        icon={<StarIcon fontSize="large" />}
        precision={0.5}
        getLabelText={getLabelText}
        onChange={handleRatingChange}
        sx={{
          "& .MuiRating-iconActive": {
            transform: "none",
          },
          ...((sx as object) || {}),
        }}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="large" />}
      />
    </>
  );
};

export default RatingCustom;
