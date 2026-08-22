import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  DUPLICATE_CANDIDATES,
  RESOLVE_DUPLICATE,
} from "@/graphql/queries/duplicates";
import { DuplicatePairType } from "@/interfaces/duplicates";
import { _get } from "@/utils";

/**
 * The duplicate queue, and what a decision does to it.
 *
 * `busyId` exists because a decision is a round trip: without it a click does
 * nothing visible until the list reloads, and a failed decision looks exactly
 * like a successful one. The same reason `useQueueDecision` owns row state
 * for the queues beside this.
 */
const useDuplicateQueue = () => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const { data, loading, refetch } = useQuery(DUPLICATE_CANDIDATES, {
    // What is waiting changes the moment somebody decides, so it is never
    // served from the cache.
    fetchPolicy: "network-only",
  });
  const [resolveOne] = useMutation(RESOLVE_DUPLICATE);

  const resolve = useCallback(
    async (id: string, status: string) => {
      setBusyId(id);

      try {
        await resolveOne({ variables: { pairId: id, status } });
        await refetch();
      } finally {
        setBusyId(null);
      }
    },
    [resolveOne, refetch],
  );

  return {
    pairs: _get<DuplicatePairType[]>(data, "duplicateCandidates", []),
    loading,
    busyId,
    resolve,
  };
};

export default useDuplicateQueue;
