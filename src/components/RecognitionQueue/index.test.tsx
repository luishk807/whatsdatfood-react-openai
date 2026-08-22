import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecognitionQueue from "@/components/RecognitionQueue";
import {
  RECOGNITION_ADMIN_LABELS,
  RECOGNITION_AWARD,
  RECOGNITION_KIND,
  RECOGNITION_STATUS,
} from "@/customConstants/recognition";
import { AdminRecognitionType } from "@/interfaces/recognition";

/**
 * Recognitions as moderation metadata.
 *
 * What matters here is that the controls match the state — an unpublished row
 * cannot be unpublished again, a verified one is not offered a second tick —
 * and that our own signals are read-only, because they are recomputed from
 * activity and a button to edit one would be undone by the next run.
 */
const row = (over: Partial<AdminRecognitionType> = {}): AdminRecognitionType => ({
  id: "1",
  kind: RECOGNITION_KIND.official,
  award: RECOGNITION_AWARD.michelinOne,
  source: "michelin",
  year: 2026,
  status: RECOGNITION_STATUS.draft,
  reference_url: "https://guide.example/one",
  ...over,
});

const handlers = () => ({
  onAdd: jest.fn().mockResolvedValue(undefined),
  onEdit: jest.fn().mockResolvedValue(undefined),
  onVerify: jest.fn().mockResolvedValue(undefined),
  onUnpublish: jest.fn().mockResolvedValue(undefined),
  onExpire: jest.fn().mockResolvedValue(undefined),
});

const show = (recognitions: AdminRecognitionType[], props = {}) => {
  const spies = handlers();

  render(
    <RecognitionQueue recognitions={recognitions} {...spies} {...props} />,
  );

  return spies;
};

describe("what a row says", () => {
  it("names the exact distinction", () => {
    show([row({ award: RECOGNITION_AWARD.bibGourmand })]);

    expect(screen.getByText("Bib Gourmand")).toBeInTheDocument();
  });

  it("says who awarded it and when it was last checked", () => {
    show([row({ verified_at: "2026-08-22T10:00:00Z" })]);

    expect(screen.getByText(/michelin/)).toBeInTheDocument();
    expect(screen.getByText(/Last checked/)).toBeInTheDocument();
  });

  it("links the source somebody checked", () => {
    show([row()]);

    expect(
      screen.getByRole("link", { name: RECOGNITION_ADMIN_LABELS.source }),
    ).toHaveAttribute("href", "https://guide.example/one");
  });

  it("says the state in words rather than only a colour", () => {
    show([row({ status: RECOGNITION_STATUS.verified })]);

    expect(screen.getByText("Admin verified")).toBeInTheDocument();
  });

  it("never calls it Michelin verified", () => {
    // The person checked a source. They are not the guide, and we have no
    // relationship with the guide.
    const copy = Object.values(RECOGNITION_ADMIN_LABELS)
      .filter((value) => typeof value === "string")
      .join(" ")
      .toLowerCase();

    expect(copy).not.toContain("michelin verified");
    expect(copy).not.toContain("official michelin");
  });
});

describe("which action a row offers", () => {
  it("offers to publish one nobody has checked", async () => {
    const spies = show([row({ status: RECOGNITION_STATUS.draft })]);

    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.verify }),
    );

    expect(spies.onVerify).toHaveBeenCalledWith("1");
  });

  it("does not offer to publish one already published", () => {
    show([row({ status: RECOGNITION_STATUS.verified })]);

    expect(
      screen.queryByRole("button", { name: RECOGNITION_ADMIN_LABELS.verify }),
    ).not.toBeInTheDocument();
  });

  it("offers to take a published one down", async () => {
    const spies = show([row({ status: RECOGNITION_STATUS.verified })]);

    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.unpublish }),
    );

    expect(spies.onUnpublish).toHaveBeenCalledWith("1");
  });

  it("offers to expire one that is still standing", async () => {
    const spies = show([row({ status: RECOGNITION_STATUS.verified })]);

    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.expire }),
    );

    expect(spies.onExpire).toHaveBeenCalledWith("1");
  });

  it("offers nothing further on one already expired", () => {
    show([row({ status: RECOGNITION_STATUS.expired })]);

    expect(
      screen.queryByRole("button", { name: RECOGNITION_ADMIN_LABELS.expire }),
    ).not.toBeInTheDocument();
  });

  it("leaves a row alone while its decision is in flight", () => {
    show([row()], { busyId: "1" });

    expect(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.verify }),
    ).toBeDisabled();
  });
});

describe("our own signals", () => {
  const ours = row({
    kind: RECOGNITION_KIND.house,
    award: RECOGNITION_AWARD.mustVisit,
    source: "whatsdatfood",
    status: RECOGNITION_STATUS.verified,
  });

  it("are shown but not editable", () => {
    // Recomputed from activity on every trending run, so a button to change
    // one would be undone by the next recompute.
    show([ours]);

    expect(screen.getByText(RECOGNITION_ADMIN_LABELS.ours)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: RECOGNITION_ADMIN_LABELS.expire }),
    ).not.toBeInTheDocument();
  });
});

describe("adding one", () => {
  it("says plainly that saving does not publish", async () => {
    show([]);

    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.add }),
    );

    expect(
      screen.getByText(RECOGNITION_ADMIN_LABELS.addingIsNotPublishing),
    ).toBeInTheDocument();
  });

  it("offers no distinction we compute ourselves", async () => {
    // A Must Visit typed by hand is the fabricated popularity the design
    // refuses to invent.
    show([]);

    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.add }),
    );

    expect(screen.queryByRole("option", { name: "Must Visit" })).toBeNull();
    expect(screen.getByRole("option", { name: "Bib Gourmand" })).toBeInTheDocument();
  });

  it("hands the typed fields up", async () => {
    const spies = show([]);

    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.add }),
    );
    await userEvent.type(
      screen.getByLabelText(RECOGNITION_ADMIN_LABELS.reference),
      "https://guide.example/two",
    );
    await userEvent.type(
      screen.getByLabelText(RECOGNITION_ADMIN_LABELS.year),
      "2026",
    );
    await userEvent.click(
      screen.getByRole("button", { name: RECOGNITION_ADMIN_LABELS.save }),
    );

    expect(spies.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceUrl: "https://guide.example/two",
        year: 2026,
      }),
    );
  });
});

describe("when the server refuses", () => {
  it("shows the reason verbatim", () => {
    // Each refusal explains a rule — no source, no link, a duplicate edition.
    // Rewording them turns an explanation into a failure message.
    show([], { error: "Link the source you checked." });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Link the source you checked.",
    );
  });
});

describe("amending one", () => {
  const open = async (label: string) =>
    userEvent.click(screen.getByRole("button", { name: label }));

  it("reuses the same form rather than a second one", async () => {
    // Same facts about the same thing. Two forms is two places for the rules
    // to drift - which is how a field ends up required when adding and
    // optional when editing.
    show([row()]);

    await open(RECOGNITION_ADMIN_LABELS.edit);

    expect(
      screen.getByLabelText(RECOGNITION_ADMIN_LABELS.reference),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(RECOGNITION_ADMIN_LABELS.award),
    ).toBeInTheDocument();
  });

  it("opens with what the row already says", async () => {
    show([
      row({
        award: RECOGNITION_AWARD.bibGourmand,
        year: 2024,
        reference_url: "https://guide.example/bib",
        internal_notes: "checked twice",
      }),
    ]);

    await open(RECOGNITION_ADMIN_LABELS.edit);

    expect(screen.getByLabelText(RECOGNITION_ADMIN_LABELS.reference)).toHaveValue(
      "https://guide.example/bib",
    );
    expect(screen.getByLabelText(RECOGNITION_ADMIN_LABELS.year)).toHaveValue("2024");
    expect(screen.getByLabelText(RECOGNITION_ADMIN_LABELS.notes)).toHaveValue(
      "checked twice",
    );
    expect(screen.getByLabelText(RECOGNITION_ADMIN_LABELS.award)).toHaveValue(
      RECOGNITION_AWARD.bibGourmand,
    );
  });

  it("hands the amendment up against that row", async () => {
    const spies = show([row({ id: "7" })]);

    await open(RECOGNITION_ADMIN_LABELS.edit);
    await userEvent.clear(screen.getByLabelText(RECOGNITION_ADMIN_LABELS.year));
    await userEvent.type(
      screen.getByLabelText(RECOGNITION_ADMIN_LABELS.year),
      "2027",
    );
    await open(RECOGNITION_ADMIN_LABELS.save);

    expect(spies.onEdit).toHaveBeenCalledWith(
      "7",
      expect.objectContaining({ year: 2027 }),
    );
    expect(spies.onAdd).not.toHaveBeenCalled();
  });

  it("warns that amending takes the badge off the site", async () => {
    // Somebody asserted that *those* values were accurate. Changing them
    // withdraws that assertion, and the person doing it should know before
    // they save rather than afterwards.
    show([row({ status: RECOGNITION_STATUS.verified })]);

    await open(RECOGNITION_ADMIN_LABELS.edit);

    expect(
      screen.getByText(RECOGNITION_ADMIN_LABELS.editingUnpublishes),
    ).toBeInTheDocument();
  });

  it("says the milder thing when adding a new one", async () => {
    show([]);

    await open(RECOGNITION_ADMIN_LABELS.add);

    expect(
      screen.getByText(RECOGNITION_ADMIN_LABELS.addingIsNotPublishing),
    ).toBeInTheDocument();
  });

  it("offers no way to edit one of our own signals", async () => {
    show([
      row({
        kind: RECOGNITION_KIND.house,
        award: RECOGNITION_AWARD.mustVisit,
        status: RECOGNITION_STATUS.verified,
      }),
    ]);

    expect(
      screen.queryByRole("button", { name: RECOGNITION_ADMIN_LABELS.edit }),
    ).not.toBeInTheDocument();
  });

  it("closes the form once the amendment lands", async () => {
    show([row()]);

    await open(RECOGNITION_ADMIN_LABELS.edit);
    await open(RECOGNITION_ADMIN_LABELS.save);

    expect(
      screen.queryByLabelText(RECOGNITION_ADMIN_LABELS.reference),
    ).not.toBeInTheDocument();
  });
});
