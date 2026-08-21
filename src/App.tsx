import { Suspense, lazy, useEffect } from "react";
import Layout from "@/components/Layout/Main";
import UserAccountLayout from "./components/Layout/UserAccount";
import SettingsLayout from "@/components/SettingsLayout";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import FeatureRoute from "@/components/FeatureRoute";
import { FEATURES } from "@/customConstants/features";
import { ROUTES } from "@/customConstants/routes";
const LazyHomepage = lazy(() => import("@/components/Homepage"));
const LazyResult = lazy(() => import("@/components/MenuResults"));
const LazyManageMenu = lazy(() => import("@/components/ManageMenu"));
const LazyNotFound = lazy(() => import("@/components/NotFound"));
const LazyContact = lazy(() => import("@/components/ContactPage"));
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
const LazySettingsHub = lazy(() => import("@/components/SettingsHub"));
const LazySettingsProfile = lazy(() => import("@/components/SettingsProfile"));
const LazySettingsAccount = lazy(() => import("@/components/SettingsAccount"));
const LazySettingsLocation = lazy(() => import("@/components/SettingsLocation"));
const LazySettingsPrivacy = lazy(() => import("@/components/SettingsPrivacy"));
const LazySettingsNotifications = lazy(
  () => import("@/components/SettingsNotifications"),
);
const LazyUserHistory = lazy(() => import("@/components/UserHistory"));
const LazyUserFavorites = lazy(() => import("@/components/UserFavorites"));
const LazyOwnerConsole = lazy(() => import("@/components/OwnerConsole"));
const LazyAdminConsole = lazy(() => import("@/components/AdminConsole"));
// Its own chunk, and the map inside it gets another: Leaflet has no business
// in the bundle somebody downloads to read a menu.
const LazyNearby = lazy(() => import("@/components/NearbyPage"));
const LazyRankings = lazy(() => import("@/components/RankingsPage"));
const LazyTastes = lazy(() => import("@/components/TastePreferencesPage"));
// Its own chunk, and never fetched while Pro is hidden: `FeatureRoute`
// resolves before the child renders, so the bundle for an unlaunched product
// is not downloaded by people who cannot see it.
const LazyPro = lazy(() => import("@/components/ProPage"));

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path={ROUTES.signIn}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazySignIN />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.createAccount}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyCreateAccount />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.logout}
          element={
            <Suspense fallback={<PageLoader />}>
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
                  <Suspense fallback={<PageLoader />}>
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
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyNearby />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.rankings}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyRankings />
              </Layout>
            </Suspense>
          }
        />
        {/* Not behind `ProtectedRoute`: a guest's tastes live in the browser
            and personalise their homepage just the same, so demanding an
            account to edit them would lock somebody out of their own
            choices. */}
        <Route
          path={ROUTES.tastes}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyTastes />
              </Layout>
            </Suspense>
          }
        />

        {/* Public. A leaderboard whose names lead nowhere unless you have
            an account is a leaderboard most readers cannot use. */}
        <Route
          path={ROUTES.profile}
          element={
            <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
                <Layout>
                  <UserAccountLayout sectionTitle="Friends">
                    <LazyUserFriendSection />
                  </UserAccountLayout>
                </Layout>
              </Suspense>
            }
          />
          {/* Settings: a list of sections, each its own screen.
              On a phone a section is a page with a way back; from `lg` up the
              same routes render beside the list. One set of components. */}
          {[
            { path: ROUTES.settings, title: SETTINGS_LABELS.hubTitle, element: <LazySettingsHub /> },
            { path: ROUTES.settingsProfile, title: SETTINGS_LABELS.profileHeading, element: <LazySettingsProfile /> },
            { path: ROUTES.settingsAccount, title: SETTINGS_LABELS.accountHeading, element: <LazySettingsAccount /> },
            { path: ROUTES.settingsLocation, title: SETTINGS_LABELS.locationHeading, element: <LazySettingsLocation /> },
            { path: ROUTES.settingsPreferences, title: SETTINGS_LABELS.preferencesHeading, element: <LazyTastes embedded /> },
            { path: ROUTES.settingsPrivacy, title: SETTINGS_LABELS.privacyHeading, element: <LazySettingsPrivacy /> },
            { path: ROUTES.settingsNotifications, title: SETTINGS_LABELS.notificationsHeading, element: <LazySettingsNotifications /> },
          ].map((section) => (
            <Route
              key={section.path}
              path={section.path}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Layout>
                    <SettingsLayout title={section.title}>
                      {section.element}
                    </SettingsLayout>
                  </Layout>
                </Suspense>
              }
            />
          ))}
          {/* The old address. Somebody's bookmark, and the link in any email
              already sent, must still land somewhere. */}
          <Route
            path={ROUTES.accountProfile}
            element={<Navigate to={ROUTES.settings} replace />}
          />
          <Route
            path={ROUTES.ratings}
            element={
              <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
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
              <Suspense fallback={<PageLoader />}>
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
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyResult />
              </Layout>
            </Suspense>
          }
        />
        {/* Signed in to reach it at all — `ProtectedRoute` is an `Outlet`
            wrapper, so this nests rather than wrapping the element. The
            server refuses `ownerMenu` to anybody without an approved claim
            on this restaurant; the route guard is convenience and the
            refusal is the protection. */}
        <Route element={<ProtectedRoute />}>
          <Route
            path={ROUTES.manageMenu}
            element={
              <Suspense fallback={<PageLoader />}>
                <Layout>
                  <LazyManageMenu />
                </Layout>
              </Suspense>
            }
          />
        </Route>

        <Route
          path={ROUTES.home}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyHomepage />
              </Layout>
            </Suspense>
          }
        />

        {/* Public, and deliberately reachable without an account. Somebody
            reporting that a menu is wrong or that their restaurant is listed
            with the wrong address is the person least likely to have one. */}
        <Route
          path={ROUTES.contact}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyContact />
              </Layout>
            </Suspense>
          }
        />

        {/* Public and unauthenticated on purpose: somebody deciding whether to
            upload a photo must be able to read the terms without an account. */}
        <Route
          path={ROUTES.privacy}
          element={
            <Suspense fallback={<PageLoader />}>
              <Layout>
                <LazyPrivacy />
              </Layout>
            </Suspense>
          }
        />
        <Route
          path={ROUTES.terms}
          element={
            <Suspense fallback={<PageLoader />}>
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
