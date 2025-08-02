import { type FC } from "react";
import { RatingItemInt } from "@/interfaces/users";
import RatingCustom from "@/components/Rating";
import { _get } from "@/utils";
import { getDate } from "@/utils/time";

import "./index.css";

const RatingItem: FC<RatingItemInt> = ({ data }) => {
  const user = _get(data, "user", null);
  const fullName = user
    ? _get(user, "first_name", "") + " " + _get(user, "last_name", "")
    : null;
  const { rating: score, title, comment, updatedAt } = data;
  console.log("user", user);
  console.log("raitng", data);
  return (
    <div className="w-full">
      <div className="w-full flex justify-between">
        <div>{fullName}</div>
        <div>{getDate(updatedAt)}</div>
      </div>
      <div className="w-full flex">
        <div>
          <RatingCustom defaultValue={score} isDisplay={true} />
        </div>
        <div>&nbsp;{title}</div>
      </div>

      <div>{comment}</div>
    </div>
  );
};

export default RatingItem;
