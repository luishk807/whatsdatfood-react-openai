import RatingCustom from "../Rating";
import { type FC, useEffect, useMemo, useState } from "react";
import { Box, Grid, TextField } from "@mui/material";
import "./index.css";
import FormComponent from "@/components/FormComponent";
import Button from "../Button";
import useUserRating from "@/customHooks/useUserRating";
import { _get } from "@/utils";
import useSnackbarHook from "@/customHooks/useSnackBar";
import {
  RatingFormCreateInterface,
  RatingPayloadType,
  UserRating,
} from "@/interfaces/users";

import { CREATE_RATING } from "@/customConstants/forms";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";

const RatingFormCreate: FC<RatingFormCreateInterface> = ({
  data,
  label,
  type,
  onPrevious,
  onSubmit,
}) => {
  const [foundUserRating, setFoundUserRating] = useState(false);
  const [formData, setFormData] = useState<RatingPayloadType>({
    id: null,
    rating: null,
    title: null,
    comment: null,
    restaurant_menu_item_id: _get(data, "id"),
  });

  const page = PAGE_DEFAULT;
  const limit = LIMIT_DEFAULT;

  const formFields = CREATE_RATING;
  const { saveRating, getUserRatingsByItemId, getAllRatingByRestItemIdQuery } =
    useUserRating();
  const { loading } = getAllRatingByRestItemIdQuery;
  const { showSnackBar, SnackbarComponent, closeSnackBar } = useSnackbarHook();

  const handleRateSubmit = async () => {
    try {
      const resp = await saveRating(formData);

      if (resp) {
        setFormData({
          ...formData,
          rating: null,
          title: null,
          comment: null,
        });

        if (onSubmit) {
          onSubmit("Your rating was saved", "success");
        } else {
          showSnackBar("Your rating was saved", "success");
          setTimeout(() => {
            closeSnackBar();
          }, 3000);
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  };

  const handleRatingChange = (value: any, name: keyof RatingPayloadType) => {
    if (value) {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: null,
      });
    }
  };

  const getUserRating = async (restItemId: number) => {
    const resp = await getUserRatingsByItemId(restItemId, page, limit);
    if (resp) {
      setFoundUserRating(true);
      setFormData({
        ...formData,
        id: _get(resp, "id"),
        title: _get(resp, "title"),
        comment: _get(resp, "comment"),
        rating: _get(resp, "rating"),
      });
    } else {
      setFoundUserRating(false);
    }
  };
  useEffect(() => {
    const itemId = _get(data, "id");
    const ratings = _get(data, "ratings.0");
    if (ratings && itemId && Object.keys(itemId).length) {
      getUserRating(Number(itemId));
    }
  }, [data]);

  return (
    <>
      <FormComponent
        submitLabel="Send My Rate"
        onPrevious={onPrevious}
        onHandleSubmit={handleRateSubmit}
        fields={formFields}
        title={`Rate ${data.name}`}
      />
      {SnackbarComponent}
    </>
  );
};
export default RatingFormCreate;
