import { ChangeEvent, FC, useRef } from "react";
import clsx from "clsx";
import { AddAPhotoIcon } from "@/components/icons";
import {
  PhotoUploadActionInterface,
  UPLOAD_VARIANT,
  UploadVariant,
} from "@/interfaces/photos";

const VARIANT_CLASSES: Record<UploadVariant, string> = {
  [UPLOAD_VARIANT.link]:
    "inline underline underline-offset-2 text-ink-muted hover:text-ink",
  [UPLOAD_VARIANT.chip]:
    "inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink hover:border-ink",
  [UPLOAD_VARIANT.tile]:
    "flex flex-col items-center gap-1 text-[11px] text-ink-muted opacity-60 transition-opacity hover:opacity-100 motion-reduce:transition-none",
};

/**
 * One tap to the camera, wherever the ask happens to be.
 *
 * There are three moments worth asking: an empty tile on the menu, the
 * stock-photo disclosure in the dish sheet, and just after somebody says they
 * ordered the dish. Each one wants to look different and none of them wants its
 * own copy of `capture="environment"`, the hidden input, or the reset that lets
 * the same file be chosen twice — that logic drifting apart between four call
 * sites is how one of them quietly stops opening the camera.
 */
const PhotoUploadAction: FC<PhotoUploadActionInterface> = ({
  onSelect,
  label,
  uploadingLabel,
  uploading,
  variant = UPLOAD_VARIANT.chip,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      onSelect(file);
    }

    // Reset so choosing the same file twice still fires.
    event.target.value = "";
  };

  const shown = uploading && uploadingLabel ? uploadingLabel : label;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        // Opens the camera directly on a phone, which is the whole point: the
        // person who can take the photo is sitting at the table.
        capture="environment"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
        className={clsx(
          VARIANT_CLASSES[variant],
          "disabled:opacity-50",
          variant === UPLOAD_VARIANT.tile && "disabled:opacity-40",
        )}
      >
        {variant !== UPLOAD_VARIANT.link && (
          <AddAPhotoIcon size={variant === UPLOAD_VARIANT.tile ? 18 : 14} />
        )}
        {shown}
      </button>
    </>
  );
};

export default PhotoUploadAction;
