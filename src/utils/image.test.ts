import { computeSquareCrop } from "@/utils/image";
import { IMAGE } from "@/customConstants/images";

describe("computeSquareCrop", () => {
  it("centres the crop on a landscape photo", () => {
    const crop = computeSquareCrop(1600, 900, 1600);

    expect(crop.size).toBe(900);
    expect(crop.sy).toBe(0);
    // Equal amounts trimmed from each side, so the dish stays centred.
    expect(crop.sx).toBe(350);
    expect(1600 - crop.size - crop.sx).toBe(350);
  });

  it("centres the crop on a portrait photo", () => {
    const crop = computeSquareCrop(900, 1600, 1600);

    expect(crop.size).toBe(900);
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBe(350);
  });

  it("leaves a square photo alone", () => {
    const crop = computeSquareCrop(800, 800, 1600);

    expect(crop).toMatchObject({ sx: 0, sy: 0, size: 800, target: 800 });
  });

  it("scales a large phone photo down to the limit", () => {
    const crop = computeSquareCrop(3024, 4032);

    expect(crop.target).toBe(IMAGE.MAX_UPLOAD_EDGE);
    expect(crop.size).toBe(3024);
  });

  it("never upscales a small photo", () => {
    const crop = computeSquareCrop(300, 300, 1600);

    expect(crop.target).toBe(300);
  });

  it("handles an odd-numbered offset without a fractional pixel", () => {
    const crop = computeSquareCrop(1001, 500, 1600);

    expect(Number.isInteger(crop.sx)).toBe(true);
    expect(Number.isInteger(crop.sy)).toBe(true);
  });

  it("does not produce a negative source rectangle", () => {
    const crop = computeSquareCrop(0, 0, 1600);

    expect(crop.size).toBe(0);
    expect(crop.sx).toBeGreaterThanOrEqual(0);
    expect(crop.sy).toBeGreaterThanOrEqual(0);
  });
});
