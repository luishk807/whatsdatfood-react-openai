import { type FC, lazy, Suspense } from "react";
import { SEARCH_LABELS } from "@/customConstants/labels";

const LazyMainSearch = lazy(() => import("@/components/MainSearchBar"));

/**
 * The front door.
 *
 * It used to be a heading and a text box centred in an empty white page: no
 * indication that the answer is photographs, and on a phone the entire first
 * screen given over to nothing. The search stays the main action - it is what
 * people came to do - but it sits high, and the food starts immediately under
 * it rather than a scroll away.
 */
const Homepage: FC = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-16 pt-8 sm:pt-14">
    <div className="flex flex-col gap-2 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {SEARCH_LABELS.title}
      </h1>
      <p className="text-sm text-ink-muted sm:text-base">
        {SEARCH_LABELS.subtitle}
      </p>
    </div>

    <Suspense
      fallback={
        <div className="h-12 w-full animate-pulse rounded-pill bg-surface-sunken" />
      }
    >
      <LazyMainSearch />
    </Suspense>
  </div>
);

export default Homepage;
