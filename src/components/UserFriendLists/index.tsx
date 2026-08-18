import { useEffect, useState, type FC } from "react";
import useUserFriend from "@/customHooks/useUserFriend";
import { UserFriend } from "@/interfaces/users";
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

      setFriends(data as UserFriend[]);
    };
    fetchAllFriends();
  }, []);

  if (loading) {
    return <h1>...loading</h1>;
  }

  return (
    <div className="w-full">
      <div className="flex w-full justify-end py-[10px]">
        <Button onClick={onCreate} className="m-0 w-auto px-2 py-[5px] text-xs">
          Add Friend
        </Button>
      </div>
      {!!friends.length ? (
        friends.map((friend) => {
          return (
            <div
              key={friend.id}
              className="line-separator-top grid w-full grid-cols-12 py-[10px]"
            >
              <div className="col-span-5 flex justify-start">{friend.name}</div>
              <div className="col-span-4 flex justify-center">
                {friend.email}
              </div>
              <div className="col-span-3 flex justify-end">{friend.phone}</div>
            </div>
          );
        })
      ) : (
        <div>No Friends</div>
      )}
    </div>
  );
};

export default UserFriendLists;
