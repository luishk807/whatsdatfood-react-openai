import { type FC, useMemo, Suspense } from "react";
import { useParams } from "react-router-dom";
import { Grid } from "@mui/material";
import { convertCurrency } from "utils";
import SamplerResults from "samples/menu-item.json";
import { MenuItemType } from "types";
import MenuItem from "components/MenuItem";
import "./index.css";

const MenuResults: FC = () => {
  const { restaurant } = useParams();
  console.log(SamplerResults);
  console.log("result", restaurant);

  const map = new Map();

  SamplerResults.menu.forEach((item) => {
    if (!map.has(item.category)) {
      map.set(item.category, [item]);
    } else {
      const values = map.get(item.category);
      values.push(item);
      map.set(item.category, values);
    }
  });

  const newMenu = Object.fromEntries(map);

  console.log(newMenu);
  return (
    <Grid container>
      <Grid size={12}>
        <h1>{restaurant}</h1>
      </Grid>
      <Grid size={12}>
        {Object.keys(newMenu).map((category) => {
          return (
            <Grid container className="menu-result-category-container">
              <Grid
                size={12}
                className="menu-result-category-title  alex-brush-regular"
              >
                {category}
              </Grid>
              <Grid size={12}>
                {newMenu[category].map((item: any, indx: number) => (
                  <MenuItem key={indx} item={item} />
                ))}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Grid>
  );
};

export default MenuResults;
