import { Suspense, lazy, useEffect } from "react";
import Layout from "@/components/Layout/Main";
import UserAccountLayout from "./components/Layout/UserAccount";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Loading from "@/components/Loading";
import FeatureRoute from "@/components/FeatureRoute";
import { FEATURES } from "@/customConstants/features";
import { ROUTES } from "@/customConstants/routes";
const LazyHomepage = lazy(() => import("@/components/Homepage"));
const LazyResult = lazy(() => import("@/components/MenuResults"));
const LazyNotFound = lazy(() => import("@/components/NotFound"));
const LazyPrivacy = lazy(() => import("@/components/Privacy"));
const LazyTerms = lazy(() => import("@/components/Terms"));
const LazySignIN = lazy(() => import("@/components/SignInComponent"));
const LazyCreateAccount = lazy(() => import("@/components/CreateAccount"));
const LazyUserAccount = lazy(() => import("@/components/UserAccount"));
const LazyLogout = lazy(() => import("@/components/Logout"));
const LazyUserFriendSection = lazy(
  () => import("@/components/UserFriendSection"),
);
const LazyUserRatings = lazy(() => import("@/components/UserRatingSection"));
const LazyContributions = lazy(() => import("@/components/Contributions"));
const LazyContributorProfile = lazy(
  () => import("@/components/ContributorProfile"),
);
const LazyUserSettings = lazy(() => import("@/components/UserSettings"));
const LazyUserHistory = lazy(() => import("@/components/UserHistory"));
const LazyUserFavorites = lazy(() => import("@/components/UserFavorites"));
const LazyOwnerConsole = lazy(() => import("@/components/OwnerConsole"));
const LazyAdminConsole = lazy(() => import("@/components/AdminConsole"));
// Its own chunk, and the map inside it gets another: Leaflet has no business
// in the bundle somebody downloads to read a menu.
const LazyNearby = lazy(() => import("@/components/NearbyPage"));
const LazyRankings = lazy(() => import("@/components/RankingsPage"));
// Its own chunk, and never fetched while Pro is hidden: `FeatureRoute`
// resolves before the child renders, so the bundle for an unlaunched product
// is not downloaded by people who cannot see it.
const LazyPro = lazy(() => import("@/components/ProPage"));

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

        {/* Pro, and the URLs somebody would guess. All four redirect home
            unless the server says this caller may see it — a 404 or a
            "coming soon" would confirm that something is being built. */}
        <Route element={<FeatureRoute feature={FEATURES.pro} />}>
          {[ROUTES.pro, ROUTES.pricing, ROUTES.upgrade, ROUTES.subscription].map(
            (path) => (
              <Route
                key={path}
                path={path}
                element={
                  <Suspense fallback={<Loading style={customStyle} />}>
                    <Layout>
                      <LazyPro />
                    </Layout>
                  </Suspense>
                }
              />
            ),
          )}
        </Route>

        {/* Browsing is public, and finding food near you is browsing. */}
        <Route
          path={ROUTES.nearby}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyNearby />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.rankings}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyRankings />
              </Layout>
            </Suspense>
          }
        />

        {/* Public. A leaderboard whose names lead nowhere unless you have
            an account is a leaderboard most readers cannot use. */}
        <Route
          path={ROUTES.profile}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyContributorProfile />
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
            path={ROUTES.contributions}
            element={
              <Suspense fallback={<Loading style={customStyle} />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Your contributions">
                    <LazyContributions />
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

        {/* Public and unauthenticated on purpose: somebody deciding whether to
            upload a photo must be able to read the terms without an account. */}
        <Route
          path={ROUTES.privacy}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyPrivacy />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.terms}
          element={
            <Suspense fallback={<Loading style={customStyle} />}>
              <Layout>
                <LazyTerms />
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
