import RatingCustom from "@/components/Rating";
import { type FC, useMemo, useState, lazy, Suspense } from "react";
import "./index.css";
import Modal from "@/components/Modal";
import { _get } from "@/utils";
import { getTotalRatings } from "@/utils/numbers";
import { MenuItemType } from "@/interfaces/restaurants";
import { RatingToogleType } from "@/types";
import SkeletonRatingListing from "@/components/SkeletonLoaders/RatingModalListing";
import SkeletonRatingCreate from "../SkeletonLoaders/RatingCreateForm";
import useSnackbarHook from "@/customHooks/useSnackBar";
export interface RatingComponentListInterface {
  data: MenuItemType;
}

const LazyRatingCreate = lazy(() => import("@/components/RatingFormCreate"));
const LazyRatingList = lazy(() => import("@/components/RatingList"));
import "./index.css";
import { AlertColor } from "@mui/material";

const RatingModalListComponent: FC<RatingComponentListInterface> = ({
  data,
}) => {
  const [ratingType, setRatingType] = useState<RatingToogleType>("list");
  const [closeModal, setCloseModal] = useState(false);

  const { showSnackBar, SnackbarComponent, closeSnackBar } = useSnackbarHook();
  const ratingNumbers = useMemo(() => {
    return data.ratings ? getTotalRatings(data.ratings) : 0;
  }, [data.ratings]);

  const handleRatingCreate = (message: string, severity: AlertColor) => {
    showSnackBar(message, severity);
    setTimeout(() => {
      closeSnackBar();
    }, 3000);
  };

  const toggleRatingMode = () => {
    switch (ratingType) {
      case "create":
        return (
          <Suspense fallback={<SkeletonRatingCreate />}>
            <LazyRatingCreate
              data={data}
              onPrevious={() => setRatingType("list")}
              onSubmit={handleRatingCreate}
            />
          </Suspense>
        );
      default:
        return (
          <>
            <Suspense fallback={<SkeletonRatingListing />}>
              <LazyRatingList
                data={data}
                onOpenCreate={() => setRatingType("create")}
              />
            </Suspense>
          </>
        );
    }
  };
  return (
    <>
      {SnackbarComponent}
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
