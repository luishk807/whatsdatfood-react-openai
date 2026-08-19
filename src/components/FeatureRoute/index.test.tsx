import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FeatureRoute from "@/components/FeatureRoute";
import { FEATURES } from "@/customConstants/features";
import { ROUTES } from "@/customConstants/routes";

const feature = { available: false, loading: false };

jest.mock("@/customHooks/useFeature", () => ({
  __esModule: true,
  default: () => feature,
}));

const show = (at: string) =>
  render(
    <MemoryRouter initialEntries={[at]}>
      <Routes>
        <Route path={ROUTES.home} element={<p>home page</p>} />
        <Route element={<FeatureRoute feature={FEATURES.pro} />}>
          <Route path={ROUTES.pro} element={<p>the pro page</p>} />
          <Route path={ROUTES.pricing} element={<p>the pro page</p>} />
          <Route path={ROUTES.upgrade} element={<p>the pro page</p>} />
          <Route path={ROUTES.subscription} element={<p>the pro page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

describe("FeatureRoute", () => {
  beforeEach(() => {
    feature.available = false;
    feature.loading = false;
  });

  describe("when the feature is not available", () => {
    it.each([ROUTES.pro, ROUTES.pricing, ROUTES.upgrade, ROUTES.subscription])(
      "sends %s to the home page",
      (path) => {
        // Not a 404 and not a "coming soon": either confirms that something
        // is being built.
        show(path);

        expect(screen.getByText("home page")).toBeInTheDocument();
        expect(screen.queryByText("the pro page")).not.toBeInTheDocument();
      },
    );

    it("leaves no trace of the feature on the page it lands on", () => {
      const { container } = show(ROUTES.pro);

      expect(container.textContent).not.toMatch(/pro|upgrade|subscription/i);
    });
  });

  describe("while the answer is still in flight", () => {
    it("renders neither the page nor a redirect", () => {
      // Showing it optimistically and hiding it a moment later is the flash
      // this exists to prevent, and on a slow connection it is long enough
      // to read.
      feature.loading = true;
      const { container } = show(ROUTES.pro);

      expect(screen.queryByText("the pro page")).not.toBeInTheDocument();
      expect(container.textContent).toBe("");
    });
  });

  describe("when it is available", () => {
    it("renders the page", () => {
      feature.available = true;
      show(ROUTES.pro);

      expect(screen.getByText("the pro page")).toBeInTheDocument();
    });
  });
});
