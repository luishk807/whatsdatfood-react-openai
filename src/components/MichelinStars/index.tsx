import { Grid } from "@mui/material";

import "./index.css";
import michelinStar from "@/assets/michelin_star.png";
import { FC, useMemo } from "react";
interface MichelinStarsInterface {
  stars?: number;
}
const MichelinStars: FC<MichelinStarsInterface> = ({ stars = 0 }) => {
  console.log(stars);
  const starsBuilder = useMemo(() => {
    for (let i = 0; i < stars; i++) {
      return (
        <li key={i}>
          <img alt="michelin star" src={michelinStar} />
        </li>
      );
    }
  }, [stars]);

  return (
    <div id="michelin-star-container">
      <ul>{starsBuilder}</ul>
    </div>
  );
};

export default MichelinStars;
