import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Loading from "./components/Loading";

const LazyHomepage = lazy(() => import("./components/Homepage"));
const LazyResult = lazy(() => import("./components/ResultSection"));

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
              <LazyHomepage />
            </Suspense>
          }
        />
        <Route
          path="/result"
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <LazyResult />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
