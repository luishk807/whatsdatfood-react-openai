import { FC } from "react";
import { UserFriendCreateInt } from "@/interfaces/users";
import FormComponent from "@/components/FormComponent";
import { CREATE_USER_FRIEND } from "@/customConstants/forms";

const UserFriendCreate: FC<UserFriendCreateInt> = ({ type, onPrevious }) => {
  console.log("type", type);
  const fields = CREATE_USER_FRIEND;
  const handleSubmit = () => {};

  return (
    <FormComponent
      submitLabel="Create Friend"
      fields={fields}
      onPrevious={onPrevious}
      onHandleSubmit={handleSubmit}
    />
  );
};

export default UserFriendCreate;
