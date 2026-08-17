import { useEffect, useState, type FC } from "react";
import useUser from "@/customHooks/useUser";
import { UserType } from "@/interfaces/users";
import FormComponent from "@/components/FormComponent";
import DeleteAccount from "@/components/DeleteAccount";
import { Grid } from "@mui/material";
import { CREATE_ACCOUNT } from "@/customConstants/forms";
import "./index.css";

const UserSettings: FC = () => {
  const [userInfo, setUserInfo] = useState<UserType>();
  const { getUserInfo, queryGetUser, updateUser, updateUserQuery } = useUser();
  const { data: userData, loading, error } = queryGetUser;
  const {
    data: updateUserData,
    loading: updateUserLoading,
    error: updateUserError,
  } = updateUserQuery;

  const fields = CREATE_ACCOUNT;
  const fetchUserData = async () => {
    const resp = await getUserInfo();
    if (resp) {
      setUserInfo(resp as UserType);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      await updateUser(formData);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <>
      <FormComponent<UserType>
        submitLabel="Save Information"
        onHandleSubmit={handleSubmit}
        defaultValue={userInfo}
        fields={fields}
      />
      {/* Below the form and behind a confirmation: this is the one control here
          that cannot be undone. */}
      <DeleteAccount />
    </>
  );
};

export default UserSettings;
