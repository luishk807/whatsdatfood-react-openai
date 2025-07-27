import { Box, Skeleton } from "@mui/material";
import { lazy, Suspense, useState, useEffect, type FC } from "react";
import {
  RestaurantType,
  RestaurantAmenitiesIconInt,
} from "@/interfaces/restaurants";
import { RESTAURANT_AMENITIES_OPTIONS } from "@/customConstants";
import "./index.css";
import { removeDashDBName } from "@/utils";

const CloseIcon = lazy(() => import("@mui/icons-material/CloseRounded"));
const CheckIcon = lazy(() => import("@mui/icons-material/CheckRounded"));

const RestaurantAmenitiesIcon: FC<RestaurantAmenitiesIconInt> = ({
  restaurant,
}) => {
  const [elementList, setElementList] = useState<React.JSX.Element[] | null>(
    null,
  );
  useEffect(() => {
    let element: React.JSX.Element[] = [];
    Object.keys(restaurant).forEach((key, indx) => {
      if (RESTAURANT_AMENITIES_OPTIONS.includes(key)) {
        const value = restaurant[key as keyof RestaurantType] as boolean;
        const keyName = removeDashDBName(key);
        switch (key) {
          case "cash_only":
          case "card_payment":
          case "drive_through":
          case "reservation_required":
          case "delivery_option":
          case "parking_available":
            element.push(
              <Box key={indx} className={`flex ${!value && "not-available"}`}>
                <AvailableIcon available={value} />
                &nbsp;{keyName}
              </Box>,
            );
            break;
        }
      }
    });

    setElementList(element);
  }, [restaurant]);

  const AvailableIcon = ({ available }: { available: boolean }) => {
    const Icon = available ? CheckIcon : CloseIcon;
    return (
      <Suspense
        fallback={
          <Box>
            <Skeleton
              animation="wave"
              variant="circular"
              width={30}
              height={30}
            />
          </Box>
        }
      >
        <Icon />
      </Suspense>
    );
  };
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
      }}
    >
      {elementList && elementList.map((element, indx) => element)}
    </Box>
  );
};

export default RestaurantAmenitiesIcon;
