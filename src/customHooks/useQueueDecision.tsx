import { useCallback, useState } from "react";
import { QueueDecision } from "@/interfaces/ownership";

/**
 * One decision on one row of a review queue.
 *
 * Every queue in the admin console is the same shape — a list of things
 * waiting, two buttons on each, an await in between — and all three used to
 * fire and forget. Clicking Approve did nothing visible until the whole page
 * reloaded behind it, so the natural response was to click it again, and a
 * failed decision looked exactly like a successful one.
 *
 * Which row is busy, not merely that something is: disabling the whole queue
 * while one claim resolves is how a moderator ends up waiting on a request
 * they cannot see.
 */
const useQueueDecision = (decide: QueueDecision) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);

  const run = useCallback(
    async (id: string, affirmative: boolean) => {
      // A second click on a row already in flight is the same decision twice.
      if (busyId) {
        return;
      }

      setBusyId(id);
      setFailedId(null);

      try {
        await decide(id, affirmative);
      } catch {
        // Named on the row rather than at the top of the page: with three
        // queues open, "that did not work" out of context says nothing about
        // what is still waiting for a decision.
        setFailedId(id);
      } finally {
        setBusyId(null);
      }
    },
    [busyId, decide],
  );

  return { busyId, failedId, run };
};

export default useQueueDecision;
