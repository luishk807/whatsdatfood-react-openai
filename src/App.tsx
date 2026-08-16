import { Suspense, lazy, useEffect } from "react";
import Layout from "@/components/Layout/Main";
import UserAccountLayout from "./components/Layout/UserAccount";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "@/components/Loading";
import { ROUTES } from "@/customConstants/routes";
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
const LazyUserRatings = lazy(() => import("@/components/UserRatingSection"));
const LazyUserSettings = lazy(() => import("@/components/UserSettings"));
const LazyUserHistory = lazy(() => import("@/components/UserHistory"));
const LazyUserFavorites = lazy(() => import("@/components/UserFavorites"));
const LazyOwnerConsole = lazy(() => import("@/components/OwnerConsole"));
const LazyAdminConsole = lazy(() => import("@/components/AdminConsole"));

function App() {
  const customStyle = {
    width: "30px",
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path={ROUTES.signIn}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazySignIN />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.createAccount}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyCreateAccount />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.logout}
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
            path={ROUTES.account}
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
            path={ROUTES.friends}
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
            path={ROUTES.settings}
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
            path={ROUTES.ratings}
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
            path={ROUTES.history}
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="History">
                    <LazyUserHistory />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path={ROUTES.manage}
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Manage">
                    <LazyOwnerConsole />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path={ROUTES.admin}
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Review">
                    <LazyAdminConsole />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          <Route
            path={ROUTES.favorites}
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
        </Route>

        {/* Browsing is public. A visitor can search and read a menu before
            signing up; voting and reviewing still prompt for a session. */}
        <Route
          path={ROUTES.menuResults}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyResult />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.home}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyHomepage />
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
