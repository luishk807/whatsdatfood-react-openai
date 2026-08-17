import { render, screen } from "@testing-library/react";
import LegalPage from "@/components/LegalPage";
import {
  LEGAL_EFFECTIVE,
  LEGAL_CONTACT,
  PRIVACY_SECTIONS,
  TERMS_SECTIONS,
  PRIVACY_TITLE,
  PRIVACY_INTRO,
} from "@/customConstants/legal";

/**
 * These assert the promises the documents make, not their prose.
 *
 * A policy is a published statement of fact about the product, so the parts
 * worth pinning are the ones that would be false if the code changed: that the
 * terms actually grant a licence to display uploaded photos, and that the
 * privacy policy names every service the data reaches.
 */
describe("LegalPage", () => {
  it("renders every section it is given", () => {
    render(
      <LegalPage
        title={PRIVACY_TITLE}
        intro={PRIVACY_INTRO}
        sections={PRIVACY_SECTIONS}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: PRIVACY_TITLE }),
    ).toBeInTheDocument();

    PRIVACY_SECTIONS.forEach((section) => {
      expect(
        screen.getByRole("heading", { level: 2, name: section.heading }),
      ).toBeInTheDocument();
    });
  });

  it("says when it was last updated", () => {
    // A policy with no date cannot be shown to have been in force at a moment.
    render(
      <LegalPage title="Privacy" intro="x" sections={PRIVACY_SECTIONS} />,
    );

    expect(
      screen.getByText(new RegExp(LEGAL_EFFECTIVE)),
    ).toBeInTheDocument();
  });

  it("renders bullets as a list, not as a paragraph", () => {
    render(
      <LegalPage
        title="T"
        intro="i"
        sections={[{ heading: "H", bullets: ["one", "two"] }]}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("copes with a section that is only prose", () => {
    render(
      <LegalPage
        title="T"
        intro="i"
        sections={[{ heading: "H", paragraphs: ["just prose"] }]}
      />,
    );

    expect(screen.getByText("just prose")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

describe("what the documents actually commit to", () => {
  const privacyText = PRIVACY_SECTIONS.flatMap((s) => [
    s.heading,
    ...(s.paragraphs ?? []),
    ...(s.bullets ?? []),
  ]).join(" ");

  const termsText = TERMS_SECTIONS.flatMap((s) => [
    s.heading,
    ...(s.paragraphs ?? []),
    ...(s.bullets ?? []),
  ]).join(" ");

  it("grants a licence to display an uploaded photo", () => {
    // The gap that made publishing strangers' photographs indefensible: the
    // product displayed them with no stated right to.
    expect(termsText).toMatch(/licence/i);
    expect(termsText).toMatch(/non-exclusive/i);
    expect(termsText).toMatch(/you keep ownership/i);
  });

  it("names every service the data reaches", () => {
    // Each of these is in the code: hosting, storage, menu generation, photo
    // search, screening and email. A processor left unnamed is the omission a
    // privacy review finds first.
    ["Railway", "Cloudflare", "OpenAI", "Google", "Rekognition", "SendGrid"].forEach(
      (service) => expect(privacyText).toContain(service),
    );
  });

  it("admits that a photo becomes public", () => {
    expect(privacyText).toMatch(/public/i);
  });

  it("says GPS metadata is stripped, because the code strips it", () => {
    expect(privacyText).toMatch(/GPS/);
  });

  it("describes the account deletion the product actually has", () => {
    // This test used to assert the opposite - that the policy admitted there
    // was no delete button - and it failed the moment the button shipped, which
    // is the whole reason for pinning a published claim to the code.
    expect(privacyText).toMatch(/delete the whole account, from Settings/i);
    expect(privacyText).not.toMatch(/not yet a button/i);
    expect(privacyText).toContain(LEGAL_CONTACT);
  });

  it("says photo files go, not just the records pointing at them", () => {
    // The foreign key is ON DELETE SET NULL: without explicit removal the
    // photograph stays public and merely loses its credit.
    expect(privacyText).toMatch(/image files themselves/i);
  });

  it("declares the one thing deletion keeps", () => {
    // A report survives a leaver so a moderation decision stays reviewable.
    // An undisclosed exception to "we delete everything" is the exception that
    // makes the rest of the sentence untrue.
    expect(privacyText).toMatch(/report stays/i);
    expect(privacyText).toMatch(/your name is removed/i);
  });

  it("discloses that friends' details belong to people who did not consent", () => {
    expect(privacyText).toMatch(/has not agreed/i);
  });

  it("warns that dietary tags are not a safety guarantee", () => {
    expect(termsText).toMatch(/allergen/i);
  });
});
