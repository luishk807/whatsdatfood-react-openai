import {
  RECOGNITION_CARD_LIMIT,
  RECOGNITION_LABELS,
  RECOGNITION_PRIORITY,
} from "@/customConstants/recognition";
import { RecognitionType } from "@/interfaces/recognition";

/**
 * Which recognitions a card shows, in which order.
 *
 * Pure, because this is the part worth testing: the ordering is a claim about
 * what matters most, and a card that leads with "Trending" over a Michelin
 * star is making the wrong one.
 */

/** Hardest to earn first. Anything unlisted sorts last rather than vanishing. */
const rank = (award: string): number => {
  const found = RECOGNITION_PRIORITY.indexOf(award);

  return found === -1 ? RECOGNITION_PRIORITY.length : found;
};

/**
 * Ordered, deduplicated, and trimmed to what a card has room for.
 *
 * **Deduplicated on the award, not the row.** A guide re-listing a restaurant
 * in consecutive years is two rows and one distinction, and a card reading
 * "★ Michelin 1 Star · ★ Michelin 1 Star" is worse than one that says it
 * once.
 *
 * **Anything without a label is dropped**, because the alternative is
 * rendering a raw slug at somebody. A signal invented on the server should
 * appear once it has words, not before.
 */
export const rankRecognitions = (
  recognitions: RecognitionType[] | null | undefined,
  limit: number = RECOGNITION_CARD_LIMIT,
): RecognitionType[] => {
  const seen = new Set<string>();
  const known = (recognitions ?? []).filter((one) => {
    if (!RECOGNITION_LABELS[one.award] || seen.has(one.award)) {
      return false;
    }

    seen.add(one.award);

    return true;
  });

  return [...known]
    .sort((left, right) => rank(left.award) - rank(right.award))
    .slice(0, limit);
};

/** What a recognition is called. Never stored, always looked up. */
export const recognitionLabel = (award: string): string =>
  RECOGNITION_LABELS[award] ?? "";
