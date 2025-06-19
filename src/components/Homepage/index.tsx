import { type FC, lazy, Suspense } from "react";
import "./index.css";
import Loading from "../Loading";
// import { getOpenAIResponse } from "api/openAI";
// import MainSearchBar from "components/MainSearchBar";
const LazyMainSerach = lazy(() => import("../MainSearchBar"));

const Homepage: FC = () => {
  const handleSubmit = async () => {
    //const resp = await getOpenAIResponse({ inputText: inputValue });
    console.log("hey");
  };

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
