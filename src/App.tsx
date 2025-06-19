import { Suspense, lazy } from "react";
import Layout from "components/Layout";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Loading from "./components/Loading";

const LazyHomepage = lazy(() => import("./components/Homepage"));
const LazyResult = lazy(() => import("./components/MenuResults"));
const LazyNotFound = lazy(() => import("./components/NotFound"));

function App() {
  const customStyle = {
    width: "30px",
  };
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyHomepage />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path="/menu-results/:restaurant"
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyResult />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <LazyNotFound />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
