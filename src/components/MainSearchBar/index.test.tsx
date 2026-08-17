import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import MainSearchBar from "@/components/MainSearchBar";
import { SEARCH_LABELS } from "@/customConstants/labels";
import { RestaurantType } from "@/interfaces/restaurants";

const getRestaurantListByName = jest.fn();
const navigate = jest.fn();

jest.mock("@/customHooks/useRestaurantMutations", () => ({
  __esModule: true,
  default: () => ({ getRestaurantListByName }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => navigate,
}));

const luger = {
  name: "Peter Luger Steak House",
  slug: "peter-luger",
  city: "Brooklyn",
} as RestaurantType;

const clam = {
  name: "Peter's Clam Bar",
  slug: "peters-clam-bar",
  city: "Island Park",
} as RestaurantType;

const show = () =>
  render(
    <MemoryRouter>
      <MainSearchBar />
    </MemoryRouter>,
  );

const type = async (text: string) => {
  await userEvent.type(screen.getByRole("searchbox"), text);
};

describe("MainSearchBar", () => {
  beforeEach(() => {
    getRestaurantListByName.mockReset().mockResolvedValue([]);
    navigate.mockReset();
  });

  describe("type-ahead", () => {
    it("looks up without letting the backend generate", async () => {
      // Generation costs money and a visitor gets five an hour; every pause
      // in someone's typing used to spend one.
      getRestaurantListByName.mockResolvedValue([luger]);
      show();
      await type("peter");

      await waitFor(() =>
        expect(getRestaurantListByName).toHaveBeenCalledWith("peter", false),
      );
    });

    it("does not fire once per keystroke", async () => {
      show();
      await type("peter");

      await waitFor(() => expect(getRestaurantListByName).toHaveBeenCalled());
      expect(getRestaurantListByName.mock.calls.length).toBeLessThan(5);
    });

    it("asks for nothing on an empty box", async () => {
      show();
      await type("a");
      await userEvent.clear(screen.getByRole("searchbox"));

      await waitFor(() =>
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument(),
      );
    });

    it("says nothing found rather than showing an empty panel", async () => {
      show();
      await type("zzz");

      expect(
        await screen.findByText(SEARCH_LABELS.nothingFound),
      ).toBeInTheDocument();
    });
  });

  describe("choosing", () => {
    it("navigates on a single click", async () => {
      getRestaurantListByName.mockResolvedValue([luger, clam]);
      show();
      await type("peter");

      const options = await screen.findAllByRole("option");
      const luger_row = options.find((row) =>
        row.textContent?.includes("Peter Luger"),
      );

      await userEvent.click(luger_row as HTMLElement);

      expect(navigate).toHaveBeenCalledWith("/menu-results/peter-luger");
    });

    it("ignores a result with no slug rather than navigating nowhere", async () => {
      getRestaurantListByName.mockResolvedValue([
        { name: "Slugless", city: "Nowhere" } as RestaurantType,
      ]);
      show();
      await type("slug");

      // The highlighter splits the name across elements, so match the row
      // rather than a text node.
      const [option] = await screen.findAllByRole("option");
      expect(option).toHaveTextContent("Slugless");

      await userEvent.click(option);

      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe("submitting", () => {
    it("is what may reach the model", async () => {
      show();
      // No suggestions in hand, so submitting has to look it up properly.
      await userEvent.type(screen.getByRole("searchbox"), "lucali{enter}");

      await waitFor(() =>
        expect(getRestaurantListByName).toHaveBeenCalledWith("lucali", true),
      );
    });

    it("goes straight there when the answer is unambiguous", async () => {
      getRestaurantListByName.mockResolvedValue([luger]);
      show();
      await userEvent.type(screen.getByRole("searchbox"), "peter luger{enter}");

      await waitFor(() =>
        expect(navigate).toHaveBeenCalledWith("/menu-results/peter-luger"),
      );
    });

    it("shows the list when the answer is ambiguous", async () => {
      getRestaurantListByName.mockResolvedValue([luger, clam]);
      show();
      await userEvent.type(screen.getByRole("searchbox"), "peter{enter}");

      const rows = await screen.findAllByRole("option");
      expect(rows.some((row) => row.textContent?.includes("Clam Bar"))).toBe(
        true,
      );
      expect(navigate).not.toHaveBeenCalled();
    });

    it("cannot be submitted empty", async () => {
      show();

      expect(
        screen.getByRole("button", { name: SEARCH_LABELS.submit }),
      ).toBeDisabled();
    });
  });

  describe("when a lookup fails", () => {
    it("says so instead of hanging on 'Looking…'", async () => {
      getRestaurantListByName.mockRejectedValue(new Error("network"));
      show();
      await type("peter");

      expect(
        await screen.findByText(SEARCH_LABELS.nothingFound),
      ).toBeInTheDocument();
    });
  });

  describe("out-of-order responses", () => {
    it("keeps the newest answer when an older one lands late", async () => {
      // A slow first request resolving after a fast second would otherwise
      // overwrite the newer results with stale ones.
      let resolveFirst: (value: RestaurantType[]) => void = () => undefined;

      getRestaurantListByName
        .mockImplementationOnce(
          () =>
            new Promise<RestaurantType[]>((resolve) => {
              resolveFirst = resolve;
            }),
        )
        .mockResolvedValue([clam]);

      show();
      await type("pete");
      await waitFor(() => expect(getRestaurantListByName).toHaveBeenCalled());

      await type("r");
      await waitFor(async () => {
        const rows = await screen.findAllByRole("option");
        expect(rows.some((r) => r.textContent?.includes("Clam Bar"))).toBe(true);
      });

      resolveFirst([luger]);

      await waitFor(() => {
        const rows = screen.queryAllByRole("option");
        expect(rows.some((r) => r.textContent?.includes("Peter Luger"))).toBe(
          false,
        );
        expect(rows.some((r) => r.textContent?.includes("Clam Bar"))).toBe(true);
      });
    });
  });
});
