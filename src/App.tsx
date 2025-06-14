import React, { Suspense } from "react";
import logo from "./logo.svg";
import "./App.css";
import Homepage from "./components/Homepage";
function App() {
  return (
    <div className="App">
        <Suspense fallback={<h1>loading</h1>}>
          <Homepage />
        </Suspense>
    </div>
  );
}

export default App;
