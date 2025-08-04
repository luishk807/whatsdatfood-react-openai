import {
  ADD_USER_FRIEND,
  GET_FRIENDS_BY_USER,
  DELETE_USER_FRIEND,
  UPDATE_USER_FRIEND,
} from "@/graphql/queries/users";
import { useLazyQuery, useMutation } from "@apollo/client";

const useUserFriend = () => {
  // Custom hook logic for user friends can be added here
  // For now, it returns a placeholder object
  const [
    getAllFriendsByUser,
    {
      loading: getAllFriendLoading,
      error: getAllFriendError,
      data: getAllFriendData,
    },
  ] = useLazyQuery(GET_FRIENDS_BY_USER, {
    fetchPolicy: "cache-and-network",
  });

  const [
    addUserFriend,
    { error: addUserError, loading: addUserLoading, data: addUserData },
  ] = useMutation(ADD_USER_FRIEND);

  const [
    deleteFriendById,
    {
      error: deleteFriendError,
      loading: deleteFriendLoading,
      data: deleteFriendData,
    },
  ] = useMutation(DELETE_USER_FRIEND);

  const [
    updateFriend,
    {
      error: updateFriendError,
      loading: updateFriendLoading,
      data: updateFriendData,
    },
  ] = useMutation(UPDATE_USER_FRIEND);

  const getAllFriends = async (page?: number, limit?: number) => {
    try {
      const response = await getAllFriendsByUser({
        variables: {
          page,
          limit,
        },
      });
      return response.data.getFriendsByUser;
    } catch (err) {
      console.error("Error fetching friends:", err);
      throw new Error("Failed to fetch friends");
    }
  };

  const addNewUserFriend = async (payload: any) => {
    try {
      const response = await addUserFriend({
        variables: { payload: { ...payload } },
      });
      return response.data.addUserFriend;
    } catch (err) {
      console.error("Error adding friend:", err);
      throw new Error("Failed to add friend");
    }
  };

  const updateUserFriend = async (payload: any) => {
    try {
      const response = await updateFriend({
        variables: { input: { payload } },
      });
      return response.data.updateUserFriend;
    } catch (err) {
      console.error("Error updating friend:", err);
      throw new Error("Failed to update friend");
    }
  };

  const deleteUserFriend = async (id: string) => {
    try {
      const response = await deleteFriendById({
        variables: { payload: id },
      });
      return response.data.deleteUserFriend;
    } catch (err) {
      console.error("Error deleting friend:", err);
      throw new Error("Failed to delete friend");
    }
  };

  return {
    getAllFriends,
    addNewUserFriend,
    updateUserFriend,
    deleteUserFriend,
    queryGetAllFriends: {
      loading: getAllFriendLoading,
      error: getAllFriendError,
      data: getAllFriendData,
    },
    queryAddNewUserFriend: {
      loading: addUserLoading,
      error: addUserError,
      data: addUserData,
    },
    queryUpdateUserFriend: {
      loading: updateFriendLoading,
      error: updateFriendError,
      data: updateFriendData,
    },
    queryDeleteUserFriend: {
      loading: deleteFriendLoading,
      error: deleteFriendError,
      data: deleteFriendData,
    },
  };
};

export default useUserFriend;
