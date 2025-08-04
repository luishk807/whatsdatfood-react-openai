import { FC } from "react";
import { UserFriendCreateInt, CreateUserFriend } from "@/interfaces/users";
import FormComponent from "@/components/FormComponent";
import { CREATE_USER_FRIEND } from "@/customConstants/forms";
import { UserFriendSectionWindows } from "@/customConstants";
import useUserFriend from "@/customHooks/useUserFriend";

const UserFriendCreate: FC<UserFriendCreateInt> = ({
  type,
  onPrevious,
  onSubmit,
}) => {
  console.log("type", type);
  const fields = CREATE_USER_FRIEND;
  const {
    addNewUserFriend,
    queryAddNewUserFriend,
    updateUserFriend,
    queryUpdateUserFriend,
  } = useUserFriend();

  const {
    error: updateFriendError,
    loading: updateFriendLoading,
    data: updateFriendData,
  } = queryUpdateUserFriend;
  const {
    error: addFriendError,
    loading: addFriendLoading,
    data: addFriendData,
  } = queryAddNewUserFriend;
  const handleSubmit = async (friendData: CreateUserFriend) => {
    switch (type) {
      case UserFriendSectionWindows.create:
        await addNewUserFriend(friendData);
        console.log("created", addFriendData);
        onSubmit && onSubmit(friendData, type);
        break;
      case UserFriendSectionWindows.edit:
        await updateUserFriend(friendData);
        console.log("saved", updateFriendData);
        onSubmit && onSubmit(friendData, type);
        break;
    }
  };

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
