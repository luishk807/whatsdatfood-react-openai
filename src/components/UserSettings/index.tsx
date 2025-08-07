import { useEffect, useState, type FC } from "react";
import useUser from "@/customHooks/useUser";
import { UserType } from "@/interfaces/users";
import FormComponent from "@/components/FormComponent";
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
      console.log(resp, "resp");
      setUserInfo(resp as UserType);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      await updateUser(formData);
      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <FormComponent<UserType>
      submitLabel="Save Information"
      onHandleSubmit={handleSubmit}
      defaultValue={userInfo}
      fields={fields}
    />
  );
};

export default UserSettings;
