import { NEARBY } from "@/customConstants/location";

/**
 * Keeping the same restaurant out of two sections at once.
 *
 * The homepage answers several questions in a row — what is popular, what you
 * like, what else is nearby — and on a catalogue this size the same handful of
 * restaurants can answer all of them. Three sections leading with the same
 * name reads as a page with one idea rather than three.
 *
 * **Relevance beats tidiness, and that is the whole design of this function.**
 * A section stripped down to two weak results, or to nothing, is worse than a
 * section that repeats something from above it — the reader loses a real
 * recommendation to gain a cosmetic one. So filtering is abandoned entirely
 * the moment it would leave too little behind, rather than partially applied:
 * a half-deduplicated row is neither honest about the repetition nor useful.
 *
 * Pure, because the priority order between sections is a product decision
 * worth testing without rendering a page.
 */
export const withoutSeen = <T extends { id: string }>(
  items: T[],
  seen: Iterable<string>,
  keep: number = NEARBY.MIN_AFTER_DEDUPE,
): T[] => {
  const already = new Set(seen);

  if (!already.size) {
    return items;
  }

  const fresh = items.filter((one) => !already.has(one.id));

  // Too few left to be worth showing: the section keeps what it had. On a
  // small catalogue occasional repetition is better than a thin row, and much
  // better than a heading over nothing.
  //
  // One rule, applied whole. An earlier version also clamped the floor to the
  // section's own length, which reads as "never demand more than existed" and
  // does nothing at all — when every item survives, both branches return the
  // same list, and when they do not, the clamp cannot rescue a row that is
  // already too thin.
  return fresh.length >= keep ? fresh : items;
};
