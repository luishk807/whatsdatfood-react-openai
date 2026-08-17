import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookmarkButton from "@/components/BookmarkButton";
import { FAVORITE_LABELS } from "@/customConstants/labels";

const isUserFavorite = jest.fn();
const saveFavorites = jest.fn();
const showSnackBar = jest.fn();
const auth = { user: null as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("@/customHooks/useUserFavorites", () => ({
  __esModule: true,
  default: () => ({ isUserFavorite, saveFavorites }),
}));

jest.mock("@/customHooks/useSnackBar", () => ({
  __esModule: true,
  default: () => ({ showSnackBar, SnackbarComponent: null }),
}));

describe("BookmarkButton", () => {
  beforeEach(() => {
    auth.user = null;
    isUserFavorite.mockReset().mockResolvedValue(false);
    saveFavorites.mockReset().mockResolvedValue(true);
    showSnackBar.mockReset();
  });

  describe("signed out", () => {
    it("asks the backend nothing", async () => {
      // Browsing is public, but "is this one of MY favourites" is not a
      // question an anonymous visitor can ask - it returned UNAUTHORIZED on
      // every menu page.
      render(<BookmarkButton slug="peter-luger" />);

      await waitFor(() => expect(isUserFavorite).not.toHaveBeenCalled());
    });

    it("says what to do instead of reporting a failure", async () => {
      render(<BookmarkButton slug="peter-luger" />);

      await userEvent.click(
        screen.getByLabelText(FAVORITE_LABELS.signInToSave),
      );

      expect(saveFavorites).not.toHaveBeenCalled();
      expect(showSnackBar).toHaveBeenCalledWith(
        FAVORITE_LABELS.signInToSave,
        "info",
      );
    });
  });

  describe("signed in", () => {
    beforeEach(() => {
      auth.user = { id: 1 };
    });

    it("checks whether the restaurant is already saved", async () => {
      isUserFavorite.mockResolvedValue(true);
      render(<BookmarkButton slug="peter-luger" />);

      await waitFor(() =>
        expect(
          screen.getByLabelText(FAVORITE_LABELS.remove),
        ).toHaveAttribute("aria-pressed", "true"),
      );
    });

    it("saves on click and confirms", async () => {
      render(<BookmarkButton slug="peter-luger" />);
      await waitFor(() => expect(isUserFavorite).toHaveBeenCalled());

      await userEvent.click(screen.getByLabelText(FAVORITE_LABELS.save));

      expect(saveFavorites).toHaveBeenCalledWith("peter-luger");
      await waitFor(() =>
        expect(showSnackBar).toHaveBeenCalledWith(
          FAVORITE_LABELS.savedToast,
          "success",
        ),
      );
    });

    it("reports a failed save", async () => {
      saveFavorites.mockRejectedValue(new Error("nope"));
      render(<BookmarkButton slug="peter-luger" />);
      await waitFor(() => expect(isUserFavorite).toHaveBeenCalled());

      await userEvent.click(screen.getByLabelText(FAVORITE_LABELS.save));

      await waitFor(() =>
        expect(showSnackBar).toHaveBeenCalledWith(
          FAVORITE_LABELS.failed,
          "error",
        ),
      );
    });

    it("does not break the page when the check fails", async () => {
      isUserFavorite.mockRejectedValue(new Error("boom"));

      expect(() =>
        render(<BookmarkButton slug="peter-luger" />),
      ).not.toThrow();

      await waitFor(() =>
        expect(screen.getByLabelText(FAVORITE_LABELS.save)).toBeInTheDocument(),
      );
    });
  });
});
