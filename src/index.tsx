import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "@/graphql";
import { AuthProvider } from "./useContext/AuthProvider";
import { DiscoveryLocationProvider } from "./useContext/DiscoveryLocationProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          {/* One location for the whole app: held per component, a fix
              granted on the home page did not exist on the page it navigated
              to. */}
          <DiscoveryLocationProvider>
            <App />
          </DiscoveryLocationProvider>
        </AuthProvider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
);

