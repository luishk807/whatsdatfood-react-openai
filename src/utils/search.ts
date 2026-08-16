import { SearchSegment } from "@/interfaces/search";

/**
 * Split a label into matched and unmatched runs, for highlighting.
 *
 * Returns data rather than a string of HTML. The previous version built
 * `<b>` tags and handed them to dangerouslySetInnerHTML, where the label is an
 * AI-generated restaurant name - markup in a name would have executed. It also
 * dropped the raw query straight into a RegExp, so typing "(" threw a
 * SyntaxError and took the whole suggestion list with it.
 */
export const splitOnMatch = (text: string, query: string): SearchSegment[] => {
  const needle = query.trim().toLowerCase();

  if (!needle || !text) {
    return [{ text, match: false }];
  }

  const haystack = text.toLowerCase();
  const segments: SearchSegment[] = [];
  let cursor = 0;

  // Plain indexOf, so no input can be interpreted as a pattern.
  for (;;) {
    const found = haystack.indexOf(needle, cursor);

    if (found === -1) {
      break;
    }

    if (found > cursor) {
      segments.push({ text: text.slice(cursor, found), match: false });
    }

    segments.push({
      text: text.slice(found, found + needle.length),
      match: true,
    });
    cursor = found + needle.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments;
};
