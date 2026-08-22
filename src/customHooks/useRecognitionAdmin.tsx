import { useCallback, useState } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_RECOGNITION,
  ADMIN_RECOGNITIONS,
  EDIT_RECOGNITION,
  EXPIRE_RECOGNITION,
  UNPUBLISH_RECOGNITION,
  VERIFY_RECOGNITION,
} from "@/graphql/queries/recognition";
import {
  AdminRecognitionType,
  NewRecognitionType,
} from "@/interfaces/recognition";
import { _get } from "@/utils";

/**
 * Curating one restaurant's recognitions.
 *
 * **Every refusal is kept and shown.** The server explains its rules in
 * sentences — no source, no reference link, a duplicate edition, one of our
 * own signals typed by hand — and each of those is the useful half of the
 * response. Swallowing them and rendering "something went wrong" would strip
 * the only thing that tells an admin what to do next.
 *
 * `busyId` exists because a decision is a round trip: without it a click does
 * nothing visible until the list reloads, and a failed decision looks exactly
 * like a successful one. The same reason `useQueueDecision` owns row state
 * for the queues beside this.
 */
const useRecognitionAdmin = () => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [load, { data, loading }] = useLazyQuery(ADMIN_RECOGNITIONS, {
    // "What is on this restaurant" changes as soon as a decision lands, so it
    // is never served from the cache.
    fetchPolicy: "network-only",
  });

  const [addOne] = useMutation(ADD_RECOGNITION);
  const [editOne] = useMutation(EDIT_RECOGNITION);
  const [verifyOne] = useMutation(VERIFY_RECOGNITION);
  const [unpublishOne] = useMutation(UNPUBLISH_RECOGNITION);
  const [expireOne] = useMutation(EXPIRE_RECOGNITION);

  const recognitions = _get<AdminRecognitionType[]>(
    data,
    "adminRecognitions",
    [],
  );

  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const open = useCallback(
    async (id: string) => {
      setRestaurantId(id);
      setError(null);
      await load({ variables: { restaurantId: id } });
    },
    [load],
  );

  const refresh = useCallback(async () => {
    if (restaurantId) {
      await load({ variables: { restaurantId } });
    }
  }, [load, restaurantId]);

  /** One shape for every decision: mark busy, act, surface a refusal, reload. */
  const decide = useCallback(
    async (id: string | null, run: () => Promise<unknown>) => {
      setBusyId(id);
      setError(null);

      try {
        await run();
        await refresh();
      } catch (refusal) {
        setError(
          refusal instanceof Error ? refusal.message : String(refusal),
        );
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  return {
    recognitions,
    /** Whether a restaurant has been looked up yet, so the list is not
     *  rendered as an empty state before anybody asked for one. */
    opened: restaurantId !== null,
    loading,
    busyId,
    error,
    open,
    add: (fields: NewRecognitionType) =>
      decide(null, () =>
        addOne({ variables: { restaurantId, ...fields } }),
      ),
    edit: (id: string, fields: NewRecognitionType) =>
      decide(id, () =>
        editOne({ variables: { recognitionId: id, ...fields } }),
      ),
    verify: (id: string) =>
      decide(id, () => verifyOne({ variables: { recognitionId: id } })),
    unpublish: (id: string) =>
      decide(id, () => unpublishOne({ variables: { recognitionId: id } })),
    expire: (id: string) =>
      decide(id, () => expireOne({ variables: { recognitionId: id } })),
  };
};

export default useRecognitionAdmin;
