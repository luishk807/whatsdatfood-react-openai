import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import DuplicateQueue from "@/components/DuplicateQueue";
import { DUPLICATE_LABELS } from "@/customConstants/labels";
import { DUPLICATE_STATUS } from "@/customConstants/duplicates";
import { DuplicatePairType } from "@/interfaces/duplicates";

/**
 * Two rows that might be one restaurant, side by side.
 *
 * The decision is a comparison, so most of what is asserted here is that the
 * comparison is actually on screen — an admin who has to open two tabs will
 * not decide, and a queue nobody works is worse than no queue.
 *
 * The other half is that nothing claims to merge anything.
 */
const side = (over = {}) => ({
  id: "1",
  slug: "russ-and-daughters-cafe",
  name: "Russ & Daughters Cafe",
  address: "127 Orchard St",
  city: "New York",
  phone: "(212) 475-4880",
  website: "https://www.russanddaughters.com",
  place_type: "restaurant",
  cuisine: "jewish",
  osm_id: "node/123",
  menu_items: 12,
  ...over,
});

const pair = (over: Partial<DuplicatePairType> = {}): DuplicatePairType => ({
  id: "p1",
  status: DUPLICATE_STATUS.pending,
  confidence: 0.95,
  metres: 2.8,
  chain_locations: 1,
  reasons: "name: identical once punctuation is ignored; distance: 3 m apart",
  left: side(),
  right: side({ id: "2", name: "Russ and Daughters Cafe", osm_id: "way/456" }),
  ...over,
});

const show = (pairs: DuplicatePairType[], props = {}) => {
  const onResolve = jest.fn();

  render(
    <MemoryRouter>
      <DuplicateQueue pairs={pairs} onResolve={onResolve} {...props} />
    </MemoryRouter>,
  );

  return onResolve;
};

describe("what the queue shows", () => {
  it("puts both restaurants on screen", () => {
    show([pair()]);

    expect(screen.getByText("Russ & Daughters Cafe")).toBeInTheDocument();
    expect(screen.getByText("Russ and Daughters Cafe")).toBeInTheDocument();
  });

  it("shows the comparison data a decision needs", () => {
    show([pair()]);

    expect(screen.getAllByText(/127 Orchard St/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/475-4880/).length).toBeGreaterThan(0);
    expect(screen.getByText("node/123")).toBeInTheDocument();
    expect(screen.getByText("way/456")).toBeInTheDocument();
  });

  it("says how far apart they are", () => {
    show([pair({ metres: 2.8 })]);

    expect(screen.getByText("3 m apart")).toBeInTheDocument();
  });

  it("says why the detector flagged them", () => {
    // A confidence number on its own is a request to trust arithmetic nobody
    // can inspect.
    show([pair()]);

    expect(screen.getByText(/identical once punctuation/)).toBeInTheDocument();
  });

  it("says when the name belongs to a chain", () => {
    // An admin looking at two rows called Pret A Manger needs to know the
    // detector knew that too, or the first thing they assume is that it did
    // not.
    show([pair({ chain_locations: 28 })]);

    expect(screen.getByText(/28 addresses/)).toBeInTheDocument();
  });

  it("says nothing about chains for an ordinary name", () => {
    show([pair({ chain_locations: 1 })]);

    expect(screen.queryByText(/addresses/)).not.toBeInTheDocument();
  });

  it("says which side has a menu and which does not", () => {
    show([pair({ right: side({ id: "2", name: "Twin", menu_items: 0 }) })]);

    expect(screen.getByText("12 dishes")).toBeInTheDocument();
    expect(screen.getByText(DUPLICATE_LABELS.noMenu)).toBeInTheDocument();
  });

  it("says plainly that nothing is merged", () => {
    // The wording has to describe what actually happens rather than implying
    // an action the product cannot take.
    show([pair()]);

    expect(screen.getByText(DUPLICATE_LABELS.noMerge)).toBeInTheDocument();
  });

  it("says so when there is nothing waiting", () => {
    show([]);

    expect(screen.getByText(DUPLICATE_LABELS.empty)).toBeInTheDocument();
  });
});

describe("deciding", () => {
  it("records that they are one restaurant", async () => {
    const onResolve = show([pair()]);

    await userEvent.click(
      screen.getByRole("button", { name: DUPLICATE_LABELS.confirm }),
    );

    expect(onResolve).toHaveBeenCalledWith("p1", DUPLICATE_STATUS.confirmed);
  });

  it("records that they are two", async () => {
    const onResolve = show([pair()]);

    await userEvent.click(
      screen.getByRole("button", { name: DUPLICATE_LABELS.reject }),
    );

    expect(onResolve).toHaveBeenCalledWith("p1", DUPLICATE_STATUS.rejected);
  });

  it("can set a pair aside without ruling on it", async () => {
    const onResolve = show([pair()]);

    await userEvent.click(
      screen.getByRole("button", { name: DUPLICATE_LABELS.dismiss }),
    );

    expect(onResolve).toHaveBeenCalledWith("p1", DUPLICATE_STATUS.dismissed);
  });

  it("leaves a pair alone while its decision is in flight", () => {
    show([pair()], { busyId: "p1" });

    expect(
      screen.getByRole("button", { name: DUPLICATE_LABELS.confirm }),
    ).toBeDisabled();
  });

  it("offers no control that would merge or delete anything", () => {
    // Belt and braces on the wording: moving photographs and votes between
    // two restaurants safely is its own piece of work, and a button implying
    // otherwise is a promise the product cannot keep.
    show([pair()]);

    for (const banned of [/merge/i, /delete/i, /remove/i, /combine/i]) {
      expect(screen.queryByRole("button", { name: banned })).toBeNull();
    }
  });
});
