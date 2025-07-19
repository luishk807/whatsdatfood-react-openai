import { _get } from "@/utils";
import { useContext } from "react";
import { AuthContext } from "@/components/useContext/AuthProvider";
const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("no Auth data available!");
  }

  return authContext;
};
export default useAuth;
