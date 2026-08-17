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
      <header>
        <Header />
      </header>
      <main id="main-app-container">
        {/* A stale tab shows an explanation, not an empty frame. */}
        <ChunkBoundary>{children}</ChunkBoundary>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
