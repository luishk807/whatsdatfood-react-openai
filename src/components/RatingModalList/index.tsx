import RatingCustom from "@/components/Rating";
import { type FC, useMemo, useState, lazy } from "react";
import "./index.css";
import Modal from "@/components/Modal";
import { _get } from "@/utils";
import { getTotalRatings } from "@/utils/numbers";
import { MenuItemType } from "@/interfaces/restaurants";
import { RatingToogleType } from "@/types";
export interface RatingComponentListInterface {
  data: MenuItemType;
}

const LazyRatingCreate = lazy(() => import("@/components/RatingModalCreate"));
const LazyRatingList = lazy(() => import("@/components/RatingList"));
import "./index.css";

const RatingModalListComponent: FC<RatingComponentListInterface> = ({
  data,
}) => {
  const [ratingType, setRatingType] = useState<RatingToogleType>("list");
  const [closeModal, setCloseModal] = useState(false);

  const ratingNumbers = useMemo(() => {
    return data.ratings ? getTotalRatings(data.ratings) : 0;
  }, [data.ratings]);

  const toggleRatingMode = () => {
    switch (ratingType) {
      case "create":
        return (
          <LazyRatingCreate
            data={data}
            onPrevious={() => setRatingType("list")}
          />
        );
      default:
        return (
          <LazyRatingList
            data={data}
            onOpenCreate={() => setRatingType("create")}
          />
        );
    }
  };
  return (
    <>
      <Modal
        closeOnParent={closeModal}
        customButton={
          <RatingCustom isDisplay={true} defaultValue={Number(ratingNumbers)} />
        }
      >
        {toggleRatingMode()}
      </Modal>
    </>
  );
};
export default RatingModalListComponent;
