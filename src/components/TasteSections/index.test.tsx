import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TasteSections from "@/components/TasteSections";
import { TASTE_LABELS } from "@/customConstants/labels";

/**
 * The personalised strips on the front door.
 *
 * These headings read "Coffee near Flushing", "Sushi near Flushing", "Ramen
 * near Flushing" - the same two words repeated down the page, at the same
 * weight as the one word that tells the sections apart. Somebody scrolling had
 * to read each heading carefully to find the one they wanted, which is the
 * opposite of what a heading is for.
 */
let nearby: Record<string, unknown>[] = [];

jest.mock("@/customHooks/useNearby", () => ({
  __esModule: true,
  useNearbyRestaurants: () => ({ places: nearby, loading: false }),
}));

const place = (id: string, name: string) => ({
  id,
  slug: name.toLowerCase(),
  name,
  distance_km: 0.4,
});

const show = () =>
  render(
    <MemoryRouter>
      <TasteSections
        location={{ latitude: 40.75, longitude: -73.99 }}
        place="Flushing"
        preferences={[
          { slug: "coffee", name: "Coffee", kind: "food", source: "explicit" },
          { slug: "sushi", name: "Sushi", kind: "food", source: "explicit" },
        ]}
      />
    </MemoryRouter>,
  );

beforeEach(() => {
  nearby = [place("1", "Dunkin"), place("2", "Busy Bee")];
});

describe("the section headings", () => {
  it("is the category and nothing else", () => {
    show();

    expect(
      screen.getByRole("heading", { name: "Coffee", level: 3 }),
    ).toBeInTheDocument();
  });

  it("does not repeat the place on every heading", () => {
    // It is established once, above, by "For you near Flushing". Repeating it
    // four times is noise the eye has to skip.
    show();

    expect(screen.queryByText(/Coffee near Flushing/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sushi near Flushing/)).not.toBeInTheDocument();
  });

  it("still says where, once, at the top", () => {
    show();

    expect(screen.getByText(TASTE_LABELS.forYou("Flushing"))).toBeInTheDocument();
  });

  it("outweighs the section above it", () => {
    // The category has to win against the "For you" heading and against the
    // card titles, or it stops working as a signpost.
    show();

    const heading = screen.getByRole("heading", { name: "Coffee", level: 3 });

    expect(heading.className).toContain("font-semibold");
    expect(heading.className).toContain("text-base");
    expect(heading.className).toContain("text-ink");
  });
});

describe("see all", () => {
  it("goes to that category, filtered", () => {
    show();

    // Two sections render, so this names the one it means.
    expect(screen.getAllByRole("link", { name: /See all/ })[0]).toHaveAttribute(
      "href",
      "/nearby?cuisine=coffee",
    );
  });

  it("is readable rather than grey on grey", () => {
    // It was 12px `ink-muted`, which is both hard to read and hard to notice.
    show();

    const link = screen.getAllByRole("link", { name: /See all/ })[0];

    expect(link.className).toContain("text-ink");
    expect(link.className).not.toContain("text-ink-muted");
  });

  it("is a full-height target rather than a line of small text", () => {
    show();

    const link = screen.getAllByRole("link", { name: /See all/ })[0];

    expect(link.className).toMatch(/min-h-11/);
  });
});

describe("when a category has nothing nearby", () => {
  it("renders no heading at all", () => {
    // Silence, not an apology. A heading over an empty row makes the
    // catalogue look broken rather than uneven.
    nearby = [];
    show();

    expect(
      screen.queryByRole("heading", { name: "Coffee" }),
    ).not.toBeInTheDocument();
  });
});
