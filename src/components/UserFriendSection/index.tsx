import { Grid } from "@mui/material";
import {
  useCallback,
  Suspense,
  lazy,
  useEffect,
  useState,
  type FC,
} from "react";
import { UserFriend } from "@/interfaces/users";
import "./index.css";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";
import { _get } from "@/utils";
import Button from "@/components/Button";
const UserFriendLists = lazy(() => import("@/components/UserFriendLists"));
const UserFriendCreate = lazy(() => import("@/components/UserFriendCreate"));
import { UserFriendSectionWindowTypes } from "@/types";
import { UserFriendSectionWindows } from "@/customConstants";

const UserFriendSection: FC = () => {
  const [toggleSection, setToogleSection] =
    useState<UserFriendSectionWindowTypes>(UserFriendSectionWindows.list);
  const [componentSelected, setComponentSelected] =
    useState<React.ReactNode>(null);

  useEffect(() => {
    getUserFriendComp();
  }, [toggleSection]);

  const getUserFriendComp = useCallback(() => {
    switch (toggleSection) {
      case UserFriendSectionWindows.list:
        console.log("list");
        setComponentSelected(
          <Suspense fallback={<div>..loading</div>}>
            <UserFriendLists
              onCreate={() => setToogleSection(UserFriendSectionWindows.create)}
            />
          </Suspense>,
        );
        break;
      case UserFriendSectionWindows.create:
        console.log("create");
        setComponentSelected(
          <Suspense fallback={<div>..loading</div>}>
            <UserFriendCreate
              onPrevious={() => setToogleSection(UserFriendSectionWindows.list)}
              type={UserFriendSectionWindows.create}
            />
          </Suspense>,
        );
        break;
      case UserFriendSectionWindows.edit:
        console.log("edit");
        setComponentSelected(
          <Suspense fallback={<div>..loading</div>}>
            <UserFriendCreate type={UserFriendSectionWindows.edit} />
          </Suspense>,
        );
        break;
    }
  }, [toggleSection]);

  return (
    <Grid container className="w-full">
      {componentSelected}
    </Grid>
  );
};

export default UserFriendSection;
