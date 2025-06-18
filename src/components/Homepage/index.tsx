import { type FC, lazy, Suspense } from "react";
import Layout from "components/Layout";
import "./index.css";
import Loading from "../Loading";
// import { getOpenAIResponse } from "api/openAI";
// import { InterfaceRequestAI } from "types/indeex";
// import MainSearchBar from "components/MainSearchBar";
const LazyMainSerach = lazy(() => import("../MainSearchBar"));

const Homepage: FC = () => {
  const handleSubmit = async () => {
    //const resp = await getOpenAIResponse({ inputText: inputValue });
    console.log("hey");
  };

  return (
    <Layout>
      <div id="main-home-search-container">
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
    </Layout>
  );
};

export default Homepage;
