import { render, screen } from "@testing-library/react";
import RecognitionBadges from "@/components/RecognitionBadges";
import {
  RECOGNITION_AWARD,
  RECOGNITION_HOUSE_SOURCE,
  RECOGNITION_KIND,
} from "@/customConstants/recognition";
import { RecognitionType } from "@/interfaces/recognition";

/**
 * Why this restaurant, out of the thirty within a mile.
 *
 * Almost everything asserted here is about a claim the badges must not make.
 * A recognition is the product saying "pay attention to this one", and that
 * is worth something only while every one of them is true and correctly
 * attributed.
 */
const official = (award: string): RecognitionType => ({
  kind: RECOGNITION_KIND.official,
  award,
  source: "michelin",
  year: 2026,
});

const house = (award: string): RecognitionType => ({
  kind: RECOGNITION_KIND.house,
  award,
  source: "whatsdatfood",
});

describe("what the badges say", () => {
  it("names the exact distinction, never its family", () => {
    // A Bib Gourmand is not a star. Collapsing both to "Michelin" puts a
    // claim on the card that the guide did not make.
    render(<RecognitionBadges recognitions={[official(RECOGNITION_AWARD.bibGourmand)]} />);

    expect(screen.getByText("Bib Gourmand")).toBeInTheDocument();
    expect(screen.queryByText(/star/i)).not.toBeInTheDocument();
  });

  it("tells two stars from one", () => {
    render(<RecognitionBadges recognitions={[official(RECOGNITION_AWARD.michelinTwo)]} />);

    expect(screen.getByText("★★ Michelin 2 Stars")).toBeInTheDocument();
  });

  it("says whose judgement our own signals are", () => {
    // "Must Visit" alone, beside a Michelin star, reads as a second award.
    // A screen reader gets no help at all from the difference between an
    // outline and a tint, so whose claim it is belongs in the announcement.
    render(<RecognitionBadges recognitions={[house(RECOGNITION_AWARD.mustVisit)]} />);

    expect(
      screen.getByLabelText(`${RECOGNITION_HOUSE_SOURCE} Must Visit`),
    ).toBeInTheDocument();
  });

  it("does not dress our own signals as somebody else's award", () => {
    const { container } = render(
      <RecognitionBadges
        recognitions={[
          official(RECOGNITION_AWARD.michelinOne),
          house(RECOGNITION_AWARD.mustVisit),
        ]}
      />,
    );

    const [guide, ours] = [...container.querySelectorAll("span span")];

    expect(guide.className).not.toEqual(ours.className);
  });
});

describe("what the badges never do", () => {
  it("renders nothing when there is nothing to say", () => {
    // Which is most restaurants. An empty row of chrome under every name is
    // how a card gets taller for no information.
    const { container } = render(<RecognitionBadges recognitions={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the field is absent entirely", () => {
    const { container } = render(<RecognitionBadges />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows no more than a card has room for", () => {
    // Past two, the badges stop being a shortcut and become the card - and
    // the reader is back to reading everything, which is the problem
    // recognition exists to solve.
    render(
      <RecognitionBadges
        recognitions={[
          official(RECOGNITION_AWARD.michelinOne),
          official(RECOGNITION_AWARD.bibGourmand),
          house(RECOGNITION_AWARD.mustVisit),
          house(RECOGNITION_AWARD.trending),
        ]}
      />,
    );

    expect(screen.getAllByText(/Michelin|Bib|Must Visit|Trending/)).toHaveLength(2);
  });

  it("leads with the hardest thing to earn", () => {
    render(
      <RecognitionBadges
        recognitions={[
          house(RECOGNITION_AWARD.trending),
          official(RECOGNITION_AWARD.michelinThree),
        ]}
        limit={1}
      />,
    );

    expect(screen.getByText("★★★ Michelin 3 Stars")).toBeInTheDocument();
    expect(screen.queryByText("Trending")).not.toBeInTheDocument();
  });

  it("draws no logo and loads no image", () => {
    // Michelin's mark is theirs and we have not established that we may use
    // it. Stars are typographic - a character we are allowed to draw.
    const { container } = render(
      <RecognitionBadges recognitions={[official(RECOGNITION_AWARD.michelinThree)]} />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("never renders an emoji", () => {
    // Same rule as Food Cred: an emoji is a different picture on every
    // platform, carries no theme colour, and cannot be swapped without
    // editing every call site.
    //
    // `Emoji_Presentation` rather than `Extended_Pictographic`, because the
    // star is deliberately the second and not the first. U+2605 is a
    // typographic character that renders as text on every platform and takes
    // the surrounding colour - which is exactly why it is drawn rather than
    // Michelin's own mark, which is theirs.
    const { container } = render(
      <RecognitionBadges
        recognitions={[
          official(RECOGNITION_AWARD.michelinOne),
          house(RECOGNITION_AWARD.mustVisit),
        ]}
      />,
    );

    expect(container.textContent ?? "").not.toMatch(/\p{Emoji_Presentation}/u);
  });

  it("shows an unknown signal nothing rather than a raw slug", () => {
    // A signal invented on the server should appear once it has words, not
    // before. "local_favourite_v2" under a restaurant's name is our
    // vocabulary leaking onto their card.
    const { container } = render(
      <RecognitionBadges
        recognitions={[{ kind: RECOGNITION_KIND.house, award: "made_up", source: "x" }]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
