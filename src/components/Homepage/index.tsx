import { type FC } from "react";
// import { getOpenAIResponse } from "api/openAI";
// import { InterfaceRequestAI } from "types/indeex";
import MainSearchBar from "components/MainSearchBar";
import Layout from "components/Layout";
import "./index.css";

const Homepage: FC = () => {
  const handleSubmit = async () => {
    //const resp = await getOpenAIResponse({ inputText: inputValue });
    console.log("hey");
  };

  return (
    <Layout>
      <div id="main-home-search-container">
        <div className="main-home-title">Find your favorite menu</div>
        <MainSearchBar />
      </div>
    </Layout>
  );
};

export default Homepage;
