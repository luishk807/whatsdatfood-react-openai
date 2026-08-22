import {
  RECOGNITION_AWARD,
  RECOGNITION_KIND,
  RecognitionKindType,
} from "@/customConstants/recognition";
import { RecognitionType } from "@/interfaces/recognition";
import { rankRecognitions } from "@/utils/recognition";

const one = (
  award: string,
  kind: RecognitionKindType = RECOGNITION_KIND.official,
): RecognitionType => ({
  kind,
  award,
  source: kind === RECOGNITION_KIND.official ? "michelin" : "whatsdatfood",
});

describe("which recognitions a card leads with", () => {
  it("puts the hardest thing to earn first", () => {
    // A card leading with "Trending" over a Michelin star is making the wrong
    // claim about what matters.
    const ranked = rankRecognitions([
      one(RECOGNITION_AWARD.trending, RECOGNITION_KIND.house),
      one(RECOGNITION_AWARD.michelinOne),
      one(RECOGNITION_AWARD.michelinThree),
    ]);

    expect(ranked[0].award).toBe(RECOGNITION_AWARD.michelinThree);
  });

  it("puts every external judgement above our own", () => {
    // A guide's is the rarer claim, and ours must not outrank it on a card.
    const ranked = rankRecognitions(
      [
        one(RECOGNITION_AWARD.mustVisit, RECOGNITION_KIND.house),
        one(RECOGNITION_AWARD.michelinSelected),
      ],
      2,
    );

    expect(ranked.map((each) => each.kind)).toEqual([
      RECOGNITION_KIND.official,
      RECOGNITION_KIND.house,
    ]);
  });

  it("says a distinction once even when it is held twice", () => {
    // A guide re-listing a restaurant in consecutive years is two rows and
    // one distinction, and "★ Michelin 1 Star · ★ Michelin 1 Star" is worse
    // than saying it once.
    const ranked = rankRecognitions([
      { ...one(RECOGNITION_AWARD.michelinOne), year: 2025 },
      { ...one(RECOGNITION_AWARD.michelinOne), year: 2026 },
    ]);

    expect(ranked).toHaveLength(1);
  });

  it("drops a signal it has no words for", () => {
    // Rendering a raw slug is our vocabulary leaking onto somebody's card.
    expect(rankRecognitions([one("invented_on_the_server")])).toEqual([]);
  });

  it("copes with the field being absent, which is the common case", () => {
    expect(rankRecognitions(undefined)).toEqual([]);
    expect(rankRecognitions(null)).toEqual([]);
    expect(rankRecognitions([])).toEqual([]);
  });

  it("never returns more than it was asked for", () => {
    const many = [
      one(RECOGNITION_AWARD.michelinThree),
      one(RECOGNITION_AWARD.bibGourmand),
      one(RECOGNITION_AWARD.mustVisit, RECOGNITION_KIND.house),
    ];

    expect(rankRecognitions(many, 1)).toHaveLength(1);
    expect(rankRecognitions(many, 2)).toHaveLength(2);
  });
});
