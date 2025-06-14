import { type FC, ReactNode } from "react";
import Header from "components/Header";
import Footer from "components/Footer";
import "./index.css";
type LayoutType = {
  children: ReactNode;
};
const Layout: FC<LayoutType> = ({ children }) => {
  return (
    <>
      <header>
        <Header />
      </header>
      <div id="main-app-container">{children}</div>
      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default Layout;
