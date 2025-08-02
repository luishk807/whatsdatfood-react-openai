import { Suspense, lazy, useEffect } from "react";
import Layout from "@/components/Layout/Main";
import UserAccountLayout from "./components/Layout/UserAccount";
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
const LazyLogout = lazy(() => import("@/components/Logout"));
const LazyUserFriendSection = lazy(
  () => import("@/components/UserFriendSection"),
);
const LazyUserRatings = lazy(() => import("@/components/UserRatings"));
const LazyUserSettings = lazy(() => import("@/components/UserSettings"));
const LazyUserSearch = lazy(() => import("@/components/UserSearches"));
const LazyUserFavorites = lazy(() => import("@/components/UserFavorites"));

function App() {
  const customStyle = {
    width: "30px",
  };

  return (
    <div className="App">
      <Routes>
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
        <Route
          path="/logout"
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyLogout />
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
                  <UserAccountLayout sectionTitle="Account">
                    <LazyUserAccount />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path="/friends"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Friends">
                    <LazyUserFriendSection />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Settings">
                    <LazyUserSettings />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path="/ratings"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Ratings">
                    <LazyUserRatings />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path="/searches"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Searches">
                    <LazyUserSearch />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path="/favorites"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Favorites">
                    <LazyUserFavorites />
                  </UserAccountLayout>
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
            path="/"
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <LazyHomepage />
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
