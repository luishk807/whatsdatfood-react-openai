import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const show = (over: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter>
      <TasteSections
        location={{ latitude: 40.75, longitude: -73.99 }}
        place="Flushing"
        preferences={[
          { slug: "coffee", name: "Coffee", kind: "food", source: "explicit" },
          { slug: "sushi", name: "Sushi", kind: "food", source: "explicit" },
        ]}
        {...over}
      />
    </MemoryRouter>,
  );

beforeEach(() => {
  nearby = [
    place("1", "Dunkin"),
    place("2", "Busy Bee"),
    place("3", "Sweet Cake"),
    place("4", "Heytea"),
  ];
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

describe("keeping the page short", () => {
  const many = [
    "coffee",
    "sushi",
    "bbq",
    "dim_sum",
    "ramen",
    "tacos",
  ].map((slug) => ({ slug, name: slug, kind: "food", source: "explicit" }));

  it("does not open with a row per saved taste", async () => {
    // Somebody who picked six things does not want six rows on arrival. At
    // that point the page stops recommending and becomes an index, which is
    // the one job it exists to do for them.
    show({ preferences: many });

    const headings = await screen.findAllByRole("heading", { level: 3 });

    expect(headings.length).toBeLessThan(many.length);
  });

  it("offers the rest rather than discarding them", async () => {
    // A hard cap silently throws away preferences somebody deliberately
    // saved.
    show({ preferences: many });

    expect(
      await screen.findByRole("button", { name: /more taste/i }),
    ).toBeInTheDocument();
  });

  it("shows them all once asked", async () => {
    show({ preferences: many });

    await userEvent.click(
      await screen.findByRole("button", { name: /more taste/i }),
    );

    expect(await screen.findAllByRole("heading", { level: 3 })).toHaveLength(
      many.length,
    );
  });

  it("offers nothing to expand when everything already fits", async () => {
    show({ preferences: many.slice(0, 2) });

    await screen.findAllByRole("heading", { level: 3 });

    expect(
      screen.queryByRole("button", { name: /more taste/i }),
    ).not.toBeInTheDocument();
  });
});

describe("not repeating what Popular already showed", () => {
  it("drops a restaurant the section above led with", async () => {
    // Three sections leading with the same name reads as a page with one
    // idea rather than three.
    show({ exclude: ["1"] });

    await screen.findAllByRole("heading", { level: 3 });

    expect(screen.queryByText("Dunkin")).not.toBeInTheDocument();
    expect(screen.getAllByText("Busy Bee").length).toBeGreaterThan(0);
  });

  it("keeps a row intact rather than leaving it thin", async () => {
    // Relevance beats tidiness: on this catalogue repetition is better than
    // a heading over one weak result.
    show({ exclude: ["1", "2", "3"] });

    await screen.findAllByRole("heading", { level: 3 });

    expect(screen.getAllByText("Dunkin").length).toBeGreaterThan(0);
  });
});
