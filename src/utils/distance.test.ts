import { milesFrom } from "@/utils/distance";
import { LOCATION_LABELS } from "@/customConstants/labels";

describe("milesFrom", () => {
  it("converts kilometres to miles", () => {
    expect(milesFrom(1.609344)).toBeCloseTo(1, 5);
  });

  it("leaves zero alone", () => {
    expect(milesFrom(0)).toBe(0);
  });
});

describe("how a distance reads", () => {
  it("is one decimal place, because the third is a lie about a geocode", () => {
    expect(LOCATION_LABELS.miles(0.6437)).toBe("0.6 mi");
  });

  it("says you are here rather than 0.0 mi", () => {
    // "0.0 mi" reads as a measurement that failed.
    expect(LOCATION_LABELS.miles(0.02)).toBe("Just here");
  });
});
