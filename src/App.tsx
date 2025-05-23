import React, { Suspense } from "react";
import logo from "./logo.svg";
import "./App.css";
import Homepage from "./components/Homepage";
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Suspense fallback={<h1>loading</h1>}>
          <Homepage />
        </Suspense>
      </header>
    </div>
  );
}

export default App;
