import { type FC } from "react";
import AccountNav from "@/components/AccountNav";

/**
 * The account screen.
 *
 * It rendered an empty div. On a wide screen that was a sidebar next to
 * nothing; on a phone, where the sidebar is hidden, it was a blank page — so
 * the one route named after the section showed the least.
 *
 * It is the menu now: a list of destinations, which is what a phone wants and
 * what a desktop reader landing here was looking for anyway.
 */
const UserAccount: FC = () => (
  <div className="w-full max-w-md">
    <AccountNav variant="list" />
  </div>
);

export default UserAccount;
