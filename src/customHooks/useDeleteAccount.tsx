import { useCallback, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { DELETE_ACCOUNT } from "@/graphql/queries/users";
import { _get } from "@/utils";

/**
 * Erasing the account, which is not undoable and not a soft delete.
 *
 * The Apollo cache is reset rather than updated afterwards: every normalised
 * entity in it belongs to a user who no longer exists, and leaving them there
 * means the next screen renders data the server would now refuse to return.
 */
const useDeleteAccount = () => {
  const client = useApolloClient();
  const [mutate, { loading }] = useMutation(DELETE_ACCOUNT);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      const resp = await mutate();
      const done = !!_get(resp, "data.deleteAccount");

      if (done) {
        await client.clearStore();
      }

      return done;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      return false;
    }
  }, [client, mutate]);

  return { deleteAccount, deleting: loading, error };
};

export default useDeleteAccount;
