import { type FC, ReactNode } from "react";
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
      <main id="main-app-container">{children}</main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;
