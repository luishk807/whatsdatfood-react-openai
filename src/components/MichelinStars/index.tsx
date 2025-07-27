import { Grid, Tooltip } from "@mui/material";

import "./index.css";
import michelinStar from "@/assets/michelin_star.png";
import { FC, useMemo, useEffect, useState } from "react";
interface MichelinStarsInterface {
  stars?: number;
}
const MichelinStars: FC<MichelinStarsInterface> = ({ stars = 0 }) => {
  const [starElem, setStarElem] = useState<any[] | null>(null);

  useEffect(() => {
    const stack = [];
    for (let i = 0; i < stars; i++) {
      stack.push(
        <li key={i}>
          <img alt="michelin star" src={michelinStar} />
        </li>,
      );
    }

    setStarElem(stack);
  }, [stars]);

  return (
    <div id="michelin-star-container">
      <Tooltip title={`${stars} Michelin Stars`}>
        <ul>{starElem && starElem.map((item) => item)}</ul>
      </Tooltip>
    </div>
  );
};

export default MichelinStars;
