import {
  useCallback,
  Suspense,
  lazy,
  useEffect,
  useState,
  type FC,
} from "react";
import { UserFriend, CreateUserFriend } from "@/interfaces/users";
import { LIMIT_DEFAULT, PAGE_DEFAULT } from "@/customConstants";
import { _get } from "@/utils";
import Button from "@/components/Button";
const UserFriendLists = lazy(() => import("@/components/UserFriendLists"));
const UserFriendCreate = lazy(() => import("@/components/UserFriendEdit"));
import { UserFriendSectionWindowTypes } from "@/types";
import { UserFriendSectionWindows } from "@/customConstants";
import useSnackbarHook from "@/customHooks/useSnackBar";

const UserFriendSection: FC = () => {
  const { showSnackBar, SnackbarComponent, closeSnackBar } = useSnackbarHook();
  const [toggleSection, setToogleSection] =
    useState<UserFriendSectionWindowTypes>(UserFriendSectionWindows.list);
  const [componentSelected, setComponentSelected] =
    useState<React.ReactNode>(null);

  useEffect(() => {
    getUserFriendComp();
  }, [toggleSection]);

  const handleFriendSubmit = (
    form: CreateUserFriend,
    type: UserFriendSectionWindowTypes,
  ) => {
    setToogleSection(UserFriendSectionWindows.list);
    switch (type) {
      case UserFriendSectionWindows.create:
        showSnackBar(`${form.name} created`, "success");
        break;
      case UserFriendSectionWindows.edit:
        showSnackBar(`${form.name} updated`, "success");
        break;
    }
    setTimeout(() => {
      closeSnackBar();
    }, 3000);
  };

  const getUserFriendComp = useCallback(() => {
    switch (toggleSection) {
      case UserFriendSectionWindows.list:
        setComponentSelected(
          <Suspense fallback={<div>..loading</div>}>
            <UserFriendLists
              onCreate={() => setToogleSection(UserFriendSectionWindows.create)}
            />
          </Suspense>,
        );
        break;
      case UserFriendSectionWindows.create:
        setComponentSelected(
          <Suspense fallback={<div>..loading</div>}>
            <UserFriendCreate
              onSubmit={handleFriendSubmit}
              onPrevious={() => setToogleSection(UserFriendSectionWindows.list)}
              type={UserFriendSectionWindows.create}
            />
          </Suspense>,
        );
        break;
      case UserFriendSectionWindows.edit:
        setComponentSelected(
          <Suspense fallback={<div>..loading</div>}>
            <UserFriendCreate
              onSubmit={handleFriendSubmit}
              type={UserFriendSectionWindows.edit}
            />
          </Suspense>,
        );
        break;
    }
  }, [toggleSection]);

  return (
    <div className="w-full">
      {SnackbarComponent}
      {componentSelected}
    </div>
  );
};

export default UserFriendSection;
