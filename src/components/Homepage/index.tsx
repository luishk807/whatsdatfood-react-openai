import { type FC, lazy, Suspense } from "react";
import "./index.css";
import Loading from "@/components/Loading";
const LazyMainSerach = lazy(() => import("../MainSearchBar"));

const Homepage: FC = () => {
  return (
    <div id="main-home-search-container" className="center-middle">
      <div className="main-home-title">Find your favorite menu</div>
      <Suspense
        fallback={
          <Loading
            style={{
              width: "30px",
              display: "flex",
              margin: "0px auto",
            }}
          />
        }
      >
        <LazyMainSerach />
      </Suspense>
    </div>
  );
};

export default Homepage;
