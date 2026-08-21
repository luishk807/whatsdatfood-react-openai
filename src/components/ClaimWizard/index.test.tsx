import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClaimWizard from "@/components/ClaimWizard";
import { CLAIM_LABELS } from "@/customConstants/labels";

/**
 * Claiming a restaurant.
 *
 * It was one button that submitted a slug and nothing else, so every claim
 * arrived at a moderator as "this person pressed a button" - while the server
 * had always accepted a role, a name, a business email, a phone and an
 * explanation. The assertions that matter are that the wizard asks what the
 * *server* says it needs, and that submitting sends all of it.
 */
const claim = jest.fn().mockResolvedValue({ id: "1", status: "pending" });
let methods: unknown[] = [];

jest.mock("@/customHooks/useRestaurantOwnership", () => ({
  __esModule: true,
  default: () => ({
    claim,
    claiming: false,
    loadVerificationMethods: jest.fn(async () => methods),
  }),
}));

const manual = {
  key: "manual",
  label: "A person will check",
  blurb: "Tell us who you are and we will confirm it.",
  collects: ["claimant_name", "business_email", "business_phone", "explanation"],
};

const show = (props = {}) =>
  render(
    <ClaimWizard
      slug="kame"
      restaurantName="Kame"
      open
      onClose={jest.fn()}
      onSubmitted={jest.fn()}
      {...props}
    />,
  );

const toDetails = async () => {
  await screen.findByText(CLAIM_LABELS.roleStep);
  await userEvent.click(screen.getByRole("button", { name: CLAIM_LABELS.next }));
};

beforeEach(() => {
  methods = [manual];
  claim.mockClear();
});

describe("asking who somebody is", () => {
  it("offers the three roles the server accepts", async () => {
    show();

    await screen.findByText(CLAIM_LABELS.roleStep);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("defaults to owner rather than to nothing", async () => {
    // A required choice with no default is a form somebody can fail to fill
    // in without noticing.
    show();

    await screen.findByText(CLAIM_LABELS.roleStep);
    expect(screen.getByRole("radio", { name: /own this restaurant/i })).toBeChecked();
  });
});

describe("what it asks for", () => {
  it("asks for what the method says it collects", async () => {
    show();
    await toDetails();

    expect(screen.getByLabelText(CLAIM_LABELS.nameLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(CLAIM_LABELS.emailLabel)).toBeInTheDocument();
    expect(screen.getByLabelText(CLAIM_LABELS.phoneLabel)).toBeInTheDocument();
  });

  it("asks for nothing the method does not collect", async () => {
    // The whole reason the list comes from the server: a method enabled later
    // asks for its own fields with no change here.
    methods = [{ ...manual, collects: ["claimant_name"] }];
    show();
    await toDetails();

    expect(screen.getByLabelText(CLAIM_LABELS.nameLabel)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(CLAIM_LABELS.emailLabel),
    ).not.toBeInTheDocument();
  });

  it("says so when the server offers no method at all", async () => {
    // Better than a form that cannot be submitted, which is the dead-button
    // problem one screen along.
    methods = [];
    show();

    expect(await screen.findByText(CLAIM_LABELS.noMethods)).toBeInTheDocument();
  });
});

describe("submitting", () => {
  it("sends everything a reviewer needs to decide", async () => {
    show();
    await toDetails();

    await userEvent.type(screen.getByLabelText(CLAIM_LABELS.nameLabel), "Ana Diaz");
    await userEvent.type(
      screen.getByLabelText(CLAIM_LABELS.emailLabel),
      "ana@kame.test",
    );
    await userEvent.click(
      screen.getByRole("button", { name: CLAIM_LABELS.submit }),
    );

    await waitFor(() =>
      expect(claim).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: "kame",
          role: "owner",
          verificationMethod: "manual",
          claimantName: "Ana Diaz",
          businessEmail: "ana@kame.test",
        }),
      ),
    );
  });

  it("refuses without a name rather than sending a claim nobody can check", async () => {
    show();
    await toDetails();

    await userEvent.click(
      screen.getByRole("button", { name: CLAIM_LABELS.submit }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CLAIM_LABELS.requiredName,
    );
    expect(claim).not.toHaveBeenCalled();
  });

  it("refuses without any way to reach the business", async () => {
    show();
    await toDetails();

    await userEvent.type(screen.getByLabelText(CLAIM_LABELS.nameLabel), "Ana");
    await userEvent.click(
      screen.getByRole("button", { name: CLAIM_LABELS.submit }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      CLAIM_LABELS.requiredContact,
    );
  });

  it("says what happens next rather than closing silently", async () => {
    // This is the one flow where somebody hands over a name and a business
    // email and then waits for a stranger. A form that just shuts looks like
    // it did nothing.
    show();
    await toDetails();

    await userEvent.type(screen.getByLabelText(CLAIM_LABELS.nameLabel), "Ana");
    await userEvent.type(
      screen.getByLabelText(CLAIM_LABELS.emailLabel),
      "ana@kame.test",
    );
    await userEvent.click(
      screen.getByRole("button", { name: CLAIM_LABELS.submit }),
    );

    expect(await screen.findByText(CLAIM_LABELS.sentBody)).toBeInTheDocument();
  });

  it("shows a server refusal in the server's own words", async () => {
    // Each one explains a rule. Rewording it here turns an explanation into a
    // shrug.
    claim.mockRejectedValueOnce(new Error("That restaurant is already claimed"));
    show();
    await toDetails();

    await userEvent.type(screen.getByLabelText(CLAIM_LABELS.nameLabel), "Ana");
    await userEvent.type(
      screen.getByLabelText(CLAIM_LABELS.emailLabel),
      "ana@kame.test",
    );
    await userEvent.click(
      screen.getByRole("button", { name: CLAIM_LABELS.submit }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That restaurant is already claimed",
    );
  });
});

describe("what it never claims", () => {
  it("never says the claim is approved or verified", async () => {
    // Submitting grants nothing. The server re-checks an approved claim on
    // that specific restaurant for every owner action regardless.
    const copy = Object.values(CLAIM_LABELS).join(" ").toLowerCase();

    expect(copy).not.toMatch(/\bverified\b/);
    expect(copy).not.toMatch(/\bapproved\b/);
  });
});
