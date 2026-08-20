import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";
import MenuTrust from "@/components/MenuTrust";
import { MENU_EDIT_LABELS } from "@/customConstants/labels";

describe("MenuTrust", () => {
  it("says nothing when nothing has happened", () => {
    // Almost every restaurant. "Menu last updated: never" draws attention to
    // an absence nobody was worried about, in the one place a reader is
    // deciding whether to trust the page.
    const { container } = render(<MenuTrust />);

    expect(container).toBeEmptyDOMElement();
  });

  it("says when the restaurant has confirmed its menu", () => {
    render(<MenuTrust verifiedAt={dayjs().toISOString()} />);

    expect(
      screen.getByText(MENU_EDIT_LABELS.menuVerified),
    ).toBeInTheDocument();
  });

  it("prefers confirmed over updated", () => {
    // A restaurant that confirmed its menu and then fixed a price has
    // already said the stronger thing.
    render(
      <MenuTrust
        verifiedAt={dayjs().subtract(9, "day").toISOString()}
        updatedAt={dayjs().toISOString()}
      />,
    );

    expect(screen.getByText(MENU_EDIT_LABELS.menuVerified)).toBeInTheDocument();
    expect(screen.queryByText(/updated/i)).not.toBeInTheDocument();
  });

  it("says how long ago it was touched", () => {
    render(<MenuTrust updatedAt={dayjs().subtract(3, "day").toISOString()} />);

    expect(
      screen.getByText(MENU_EDIT_LABELS.menuUpdated("3 days ago")),
    ).toBeInTheDocument();
  });

  it("renders nothing for an unparseable date rather than Invalid Date", () => {
    const { container } = render(<MenuTrust updatedAt="not a date" />);

    expect(container).toBeEmptyDOMElement();
  });
});
