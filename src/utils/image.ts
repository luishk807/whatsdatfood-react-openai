import { IMAGE } from "@/customConstants/images";

export interface SquareCrop {
  /** Source rectangle to read from the original. */
  sx: number;
  sy: number;
  size: number;
  /** Edge length to draw into — never larger than the source. */
  target: number;
}

/**
 * The centre square of an image, scaled down to at most `maxEdge`.
 *
 * Kept pure and separate from the canvas work so the arithmetic can be tested;
 * getting this wrong crops people's food off the edge of the frame.
 */
export const computeSquareCrop = (
  width: number,
  height: number,
  maxEdge: number = IMAGE.MAX_UPLOAD_EDGE,
): SquareCrop => {
  const size = Math.max(Math.min(width, height), 0);

  return {
    sx: Math.floor((width - size) / 2),
    sy: Math.floor((height - size) / 2),
    size,
    // Never upscale: a small photo stays small rather than being blurred up.
    target: Math.min(size, maxEdge),
  };
};

/**
 * Resize and square-crop in the browser before uploading.
 *
 * A 12MP phone photo is around 4MB; this sends roughly a tenth of that. On
 * restaurant wifi that is the difference between an upload that finishes and
 * one the user abandons.
 */
export const prepareUpload = async (
  file: File,
  maxEdge: number = IMAGE.MAX_UPLOAD_EDGE,
): Promise<Blob> => {
  if (typeof createImageBitmap !== "function") {
    // Older browsers still get a working upload; the server resizes anyway.
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const { sx, sy, size, target } = computeSquareCrop(
    bitmap.width,
    bitmap.height,
    maxEdge,
  );

  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(bitmap, sx, sy, size, size, 0, 0, target, target);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );

  return blob ?? file;
};
