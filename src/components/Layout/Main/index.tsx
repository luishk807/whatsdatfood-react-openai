import { type FC, ReactNode } from "react";
import ChunkBoundary from "@/components/ChunkBoundary";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./index.css";
type LayoutType = {
  children: ReactNode;
};
const Layout: FC<LayoutType> = ({ children }) => {
  return (
    <div id="main-layout">
      {/* **Not wrapped in a `<header>`, and that is load-bearing.** `Header`
          renders its own, `position: sticky` — and a sticky element can only
          travel inside its containing block. Wrapped, that block was a box
          exactly the height of the bar itself, so the travel available to it
          was zero and the bar scrolled away with the page like any other
          element. It had never actually been pinned.

          What made that visible was the map: `/nearby` pins the map below
          the bar, so it went on reserving a bar's height for something no
          longer on screen, and the restaurant list showed through the strip.
          Unwrapped, the containing block is this column — taller than the
          viewport — so the bar has somewhere to travel and genuinely sticks.

          The wrappers were also a second `banner` and a second `contentinfo`
          around the real ones, which is a landmark inside an identical
          landmark for anybody navigating by them. */}
      <Header />
      <main id="main-app-container">
        {/* A stale tab shows an explanation, not an empty frame. */}
        <ChunkBoundary>{children}</ChunkBoundary>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
