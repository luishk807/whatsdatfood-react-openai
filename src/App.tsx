import { Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "@/components/Loading";

const LazyHomepage = lazy(() => import("@/components/Homepage"));
const LazyResult = lazy(() => import("@/components/MenuResults"));
const LazyNotFound = lazy(() => import("@/components/NotFound"));
const LazySignIN = lazy(() => import("@/components/SignInComponent"));
const LazyCreateAccount = lazy(() => import("@/components/CreateAccount"));
const LazyUserAccount = lazy(() => import("@/components/UserAccount"));
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
          path="/sign-in"
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazySignIN />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path="/create-account"
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyCreateAccount />
              </Layout>
            </Suspense>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/account"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <LazyUserAccount />
                </Layout>
              </Suspense>
            }
          />
        </Route>

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
