import { Grid } from "@mui/material";
import { useEffect, useState, type FC } from "react";
import useUserFriend from "@/customHooks/useUserFriend";
import { UserFriend } from "@/interfaces/users";
import "./index.css";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";
import { _get } from "@/utils";
import Button from "@/components/Button";

export interface UserFriendListsInt {
  onCreate?: () => void;
}
const UserFriendLists: FC<UserFriendListsInt> = ({ onCreate }) => {
  const [friends, setFriends] = useState<UserFriend[]>([]);

  const { getAllFriends, queryGetAllFriends } = useUserFriend();
  const { loading, error } = queryGetAllFriends;

  useEffect(() => {
    const fetchAllFriends = async () => {
      const page = PAGE_DEFAULT;
      const limit = LIMIT_DEFAULT;
      const resp = await getAllFriends(page, limit);

      const data = _get(resp, "data");
      const totalItems = _get(resp, "totalItems");
      const totalPages = _get(resp, "totalPages");
      const currentPage = _get(resp, "currentPage");

      console.log(data, "data");
      setFriends(data as UserFriend[]);
    };
    fetchAllFriends();
  }, []);

  if (loading) {
    return <h1>...loading</h1>;
  }

  return (
    <Grid container className="w-full">
      <Grid size={12} className="user-friends-button-section">
        <Grid container className="flex w-full justify-end">
          <Grid size={3}>
            <Button
              onClick={onCreate}
              sx={{
                fontSize: ".7em",
                padding: "5px 8px",
                width: "auto !important",
                margin: "0px",
              }}
            >
              Add Friend
            </Button>
          </Grid>
        </Grid>
      </Grid>
      {!!friends.length ? (
        friends.map((friend, indx) => {
          return (
            <Grid
              key={indx}
              size={12}
              className="w-full user-account-item-separator"
            >
              <Grid container className="w-full">
                <Grid size={4}>{friend.name}</Grid>
                <Grid size={3}>{friend.email}</Grid>
                <Grid size={3}>{friend.phone}</Grid>
                <Grid size={2}>
                  <ul>
                    <li>Delete</li>
                    <li>Edit</li>
                  </ul>
                </Grid>
              </Grid>
            </Grid>
          );
        })
      ) : (
        <Grid size={12}>No Friends</Grid>
      )}
    </Grid>
  );
};

export default UserFriendLists;
