import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AdminConsole from "@/components/AdminConsole";
import { ACCOUNT_TYPE } from "@/customConstants";
import { ADMIN_LABELS, CORRECTION_LABELS } from "@/customConstants/labels";
import { reportReasonLabel } from "@/customConstants/images";

const loadClaims = jest.fn();
const loadReports = jest.fn();
const decideClaim = jest.fn();
const resolveReport = jest.fn();
const loadPending = jest.fn();
const resolveCorrection = jest.fn();
const loadPendingDishes = jest.fn();
const decideDish = jest.fn();

const session: { role_id?: string } = {};

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => ({ user: { role_id: session.role_id } }),
}));

jest.mock("@/customHooks/useAdminQueues", () => ({
  __esModule: true,
  default: () => ({
    loadClaims,
    loadReports,
    decideClaim,
    resolveReport,
    loading: false,
  }),
}));

/**
 * The cost panel talks to Apollo directly and has its own test. Mocked here so
 * the queue tests do not need a provider.
 */
// Its own Apollo query, and this suite renders without a client on purpose -
// the console's job is composing queues, and the recognition section has its
// own tests.
// Its own Apollo query, like the recognition panel beside it. The duplicate
// queue has its own tests; this suite is about the console composing queues.
jest.mock("@/customHooks/useDuplicateQueue", () => ({
  __esModule: true,
  default: () => ({
    pairs: [],
    loading: false,
    busyId: null,
    resolve: jest.fn(),
  }),
}));

jest.mock("@/customHooks/useRecognitionAdmin", () => ({
  __esModule: true,
  default: () => ({
    recognitions: [],
    opened: false,
    loading: false,
    busyId: null,
    error: null,
    open: jest.fn(),
    add: jest.fn(),
    edit: jest.fn(),
    verify: jest.fn(),
    unpublish: jest.fn(),
    expire: jest.fn(),
  }),
}));

jest.mock("@/components/ApiUsagePanel", () => ({
  __esModule: true,
  default: () => <div>api usage</div>,
}));

jest.mock("@/components/FeatureStatus", () => ({
  __esModule: true,
  default: () => <div>feature flags</div>,
}));

jest.mock("@/customHooks/useMenuCorrections", () => ({
  __esModule: true,
  default: () => ({
    loadPending,
    resolve: resolveCorrection,
    loading: false,
  }),
}));

/**
 * Like the two above: it reaches Apollo directly, and these tests are about
 * the queues rather than about the transport.
 */
jest.mock("@/customHooks/useMenuEditing", () => ({
  __esModule: true,
  default: () => ({
    loadPendingDishes,
    decideDish,
    pendingLoading: false,
  }),
}));

const claim = {
  id: "c1",
  status: "pending" as const,
  verification_method: "email on the domain",
  note: "I run the place",
  restaurant: {
    slug: "some-place",
    name: "Some Place",
    address: "1 Main St",
    city: "Brooklyn",
  },
};

const report = {
  id: "r1",
  reason: "wrong_dish",
  note: "that is a salad",
  dish_name: "Beef Chow Fun",
  restaurant_name: "Some Place",
  restaurant_slug: "some-place",
  photo: { id: 9, url_m: "https://example.test/p.jpg", owner: "ada" },
};

const correction = {
  id: "m1",
  dish_id: "5",
  dish_name: "Beef Chow Fun",
  restaurant_name: "Some Place",
  restaurant_slug: "some-place",
  field: "price",
  value: "13.50",
  previous_value: "1350",
  status: "pending",
  suggested_by: "ada",
  createdAt: null,
};

const show = () =>
  render(
    <MemoryRouter>
      <AdminConsole />
    </MemoryRouter>,
  );

describe("AdminConsole", () => {
  beforeEach(() => {
    session.role_id = ACCOUNT_TYPE.admin;
    loadClaims.mockReset().mockResolvedValue([]);
    loadReports.mockReset().mockResolvedValue([]);
    loadPending.mockReset().mockResolvedValue([]);
    loadPendingDishes.mockReset().mockResolvedValue([]);
    decideDish.mockReset().mockResolvedValue(undefined);
    decideClaim.mockReset().mockResolvedValue(undefined);
    resolveReport.mockReset().mockResolvedValue(undefined);
    resolveCorrection.mockReset().mockResolvedValue(undefined);
  });

  describe("who it is for", () => {
    it.each([ACCOUNT_TYPE.user, ACCOUNT_TYPE.guest, undefined])(
      "says so rather than rendering blank for role %s",
      async (role) => {
        // It used to return null, which under a heading reading "Review" looks
        // like a page that failed to load.
        session.role_id = role;
        show();

        expect(screen.getByText(ADMIN_LABELS.notForYou)).toBeInTheDocument();
        expect(loadClaims).not.toHaveBeenCalled();
      },
    );

    it("asks for nothing on behalf of somebody who cannot see it", () => {
      session.role_id = ACCOUNT_TYPE.user;
      show();

      expect(loadReports).not.toHaveBeenCalled();
      expect(loadPending).not.toHaveBeenCalled();
    });
  });

  describe("what is waiting", () => {
    it("answers in one line when there is nothing", async () => {
      // The most common visit ends in "nothing to do", and that should cost
      // one glance rather than three scrolls past three empty sections.
      show();

      expect(await screen.findByText(ADMIN_LABELS.allClear)).toBeInTheDocument();
    });

    it("counts everything across the three queues", async () => {
      loadClaims.mockResolvedValue([claim]);
      loadReports.mockResolvedValue([report]);
      loadPending.mockResolvedValue([correction]);
      show();

      expect(await screen.findByText(ADMIN_LABELS.waiting(3))).toBeInTheDocument();
    });

    it("counts in the heading of the queue it belongs to", async () => {
      loadClaims.mockResolvedValue([claim]);
      show();

      expect(
        await screen.findByRole("heading", {
          name: `${ADMIN_LABELS.claims} (1)`,
        }),
      ).toBeInTheDocument();
    });
  });

  describe("deciding", () => {
    it("approves a claim and reloads what is left", async () => {
      loadClaims.mockResolvedValue([claim]);
      show();
      await screen.findByText("Some Place");

      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.approve }),
      );

      await waitFor(() => expect(decideClaim).toHaveBeenCalledWith("c1", true));
      expect(loadClaims).toHaveBeenCalledTimes(2);
    });

    it("applies a correction", async () => {
      loadPending.mockResolvedValue([correction]);
      show();
      await screen.findByText("13.50");

      await userEvent.click(
        screen.getByRole("button", { name: CORRECTION_LABELS.approve }),
      );

      await waitFor(() =>
        expect(resolveCorrection).toHaveBeenCalledWith("m1", true),
      );
    });

    it("keeps a reported photo without a confirmation", async () => {
      // Most reports are wrong. Nothing happening is the common outcome and
      // must not need a second click.
      loadReports.mockResolvedValue([report]);
      show();
      await screen.findByText("Beef Chow Fun");

      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.keepPhoto }),
      );

      await waitFor(() => expect(resolveReport).toHaveBeenCalledWith("r1", false));
    });

    it("asks twice before removing one", async () => {
      // One tap from a list of thumbnails on a phone, and removal is the only
      // way a photo disappears from this product.
      loadReports.mockResolvedValue([report]);
      show();
      await screen.findByText("Beef Chow Fun");

      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.removePhoto }),
      );

      expect(resolveReport).not.toHaveBeenCalled();

      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.confirmRemove }),
      );

      await waitFor(() => expect(resolveReport).toHaveBeenCalledWith("r1", true));
    });

    it("lets the second thought win", async () => {
      loadReports.mockResolvedValue([report]);
      show();
      await screen.findByText("Beef Chow Fun");

      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.removePhoto }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.cancel }),
      );

      expect(resolveReport).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: ADMIN_LABELS.removePhoto }),
      ).toBeInTheDocument();
    });

    it("says a decision did not stick", async () => {
      // It used to fire and forget, so a failed decision looked exactly like
      // a successful one until the next reload put the row back.
      decideClaim.mockRejectedValue(new Error("nope"));
      loadClaims.mockResolvedValue([claim]);
      show();
      await screen.findByText("Some Place");

      await userEvent.click(
        screen.getByRole("button", { name: ADMIN_LABELS.approve }),
      );

      expect(
        await screen.findByText(ADMIN_LABELS.decisionFailed),
      ).toBeInTheDocument();
    });
  });

  describe("a reported photo", () => {
    it("names the dish it is attached to", async () => {
      // "Is this that dish?" is the question a report asks, and it cannot be
      // answered from the picture alone.
      loadReports.mockResolvedValue([report]);
      show();

      expect(await screen.findByText("Beef Chow Fun")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Some Place" }),
      ).toHaveAttribute("href", "/menu-results/some-place");
    });

    it("says why it was reported in words", async () => {
      // The queue printed `wrong_dish` — a column value, shown to the one
      // person who has to weigh it against somebody's photograph.
      loadReports.mockResolvedValue([report]);
      show();

      expect(
        await screen.findByText(reportReasonLabel("wrong_dish")),
      ).toBeInTheDocument();
      expect(screen.queryByText("wrong_dish")).not.toBeInTheDocument();
    });

    it("shows a reason it does not recognise rather than swallowing it", async () => {
      loadReports.mockResolvedValue([{ ...report, reason: "brand_new_reason" }]);
      show();

      expect(await screen.findByText("brand_new_reason")).toBeInTheDocument();
    });

    it("credits the uploader, or says there is nobody to credit", async () => {
      loadReports.mockResolvedValue([{ ...report, photo: { id: 9, url_m: "x" } }]);
      show();

      expect(
        await screen.findByText(ADMIN_LABELS.unattributed),
      ).toBeInTheDocument();
    });
  });
});
