import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Loading from "./components/Loading";
const LazyHomepage = lazy(() => import("./components/Homepage"));
const LazyResult = lazy(() => import("./components/ResultSection"));

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<Loading />}>
              <LazyHomepage />
            </Suspense>
          }
        />
        <Route
          path="/result"
          element={
            <Suspense fallback={<Loading />}>
              <LazyResult />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
