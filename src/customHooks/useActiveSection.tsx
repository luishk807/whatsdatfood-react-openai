import { useEffect, useState } from "react";

/** How far down the viewport counts as "the section you are reading". */
const TOP_OFFSET = 120;

/**
 * Which menu section the reader is currently inside.
 *
 * Scroll position, not clicks: tapping a chip and then scrolling away has to
 * move the highlight, or the bar tells the reader they are somewhere they left
 * a while ago.
 *
 * Reads positions on scroll rather than using IntersectionObserver. A long menu
 * has several sections crossing the viewport at once and the question is which
 * one starts nearest the top — an observer answers "which are visible", which is
 * a different question and needs the same arithmetic afterwards anyway.
 */
const useActiveSection = (ids: string[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  // Joined rather than the array itself: a fresh array of the same ids on every
  // render would re-subscribe on every render.
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key ? key.split("|") : [];

    if (!sectionIds.length) {
      setActiveId(null);
      return;
    }

    const update = () => {
      // At the bottom of the page the last section is what is on screen, and it
      // may be too short to ever bring its own top past the line. Without this,
      // jumping to the final category highlighted the one before it - the bar
      // pointed at Soup while the reader was looking at Dessert.
      const scrolled = window.scrollY + window.innerHeight;
      const atBottom = scrolled >= document.documentElement.scrollHeight - 2;

      if (atBottom) {
        const last = sectionIds
          .filter((id) => document.getElementById(id))
          .pop();

        if (last) {
          setActiveId(last);
          return;
        }
      }

      let current = sectionIds[0];

      for (const id of sectionIds) {
        const node = document.getElementById(id);

        if (!node) {
          continue;
        }

        // The last section whose top has passed the line is the one being
        // read. Sections below it have not been reached yet.
        if (node.getBoundingClientRect().top <= TOP_OFFSET) {
          current = id;
        }
      }

      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [key]);

  return activeId;
};

export default useActiveSection;
