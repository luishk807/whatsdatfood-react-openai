import { ChangeEvent, FC, useRef, useState } from "react";
import clsx from "clsx";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AddAPhotoOutlinedIcon from "@mui/icons-material/AddAPhotoOutlined";
import Badge from "@/components/Badge";
import { DishPhotoGalleryInterface } from "@/interfaces/photos";
import { MenuItemPhoto } from "@/interfaces/restaurants";
import { BADGE_TONE, REPORT_REASONS } from "@/customConstants/images";
import { DISH_LABELS } from "@/customConstants/labels";

/**
 * Every photo of a dish, and the two things the community does with them.
 *
 * Voting is what elects the hero photo, so this screen is the mechanism, not a
 * gallery: without somewhere to vote, "the most helpful photo wins" is a rule
 * with no way to receive input.
 */
const DishPhotoGallery: FC<DishPhotoGalleryInterface> = ({
  photos,
  loading,
  canParticipate,
  hasVoted,
  onVote,
  onReport,
  onAddPhoto,
  uploading,
}) => {
  const [reportingId, setReportingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && onAddPhoto) {
      onAddPhoto(file);
    }

    event.target.value = "";
  };

  const photoId = (photo: MenuItemPhoto) => String(photo.id ?? "");

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">
          {DISH_LABELS.photosTitle}
        </h3>

        {onAddPhoto && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
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
              className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-medium text-surface disabled:opacity-60"
            >
              <AddAPhotoOutlinedIcon sx={{ fontSize: 14 }} />
              {uploading ? DISH_LABELS.uploading : DISH_LABELS.addPhoto}
            </button>
          </>
        )}
      </div>

      {loading && (
        <p className="text-xs text-ink-muted">
          {DISH_LABELS.uploading.replace("…", "")}…
        </p>
      )}

      {!loading && !photos.length && (
        <p className="text-sm text-ink-muted">
          {DISH_LABELS.noPhotosYet}
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {photos.map((photo) => {
          const id = photoId(photo);
          const voted = hasVoted?.(id);

          return (
            <li key={id} className="flex flex-col gap-2">
              <div className="relative overflow-hidden rounded-card">
                <img
                  src={photo.url_m ?? ""}
                  alt={photo.name ?? DISH_LABELS.photosTitle}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                {photo.is_primary && (
                  <div className="pointer-events-none absolute left-2 top-2">
                    <Badge tone={BADGE_TONE.top}>{DISH_LABELS.heroPhoto}</Badge>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-ink-muted">
                  {photo.owner
                    ? DISH_LABELS.photoBy(photo.owner)
                    : DISH_LABELS.stockPhoto}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!canParticipate || voted}
                    aria-pressed={!!voted}
                    aria-label={
                      voted ? DISH_LABELS.markedHelpful : DISH_LABELS.markHelpful
                    }
                    title={
                      canParticipate
                        ? DISH_LABELS.markHelpful
                        : DISH_LABELS.signInToHelp
                    }
                    onClick={() => onVote?.(id)}
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs transition-colors disabled:opacity-50 motion-reduce:transition-none",
                      voted
                        ? "border-brand bg-brand text-white"
                        : "border-line text-ink-muted",
                    )}
                  >
                    <ThumbUpAltOutlinedIcon sx={{ fontSize: 14 }} />
                    <span className="tabular-nums">
                      {photo.helpful_count ?? 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!canParticipate}
                    aria-label={DISH_LABELS.reportPhoto}
                    title={
                      canParticipate
                        ? DISH_LABELS.reportPhoto
                        : DISH_LABELS.signInToHelp
                    }
                    onClick={() =>
                      setReportingId((prev) => (prev === id ? null : id))
                    }
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line text-ink-muted disabled:opacity-50"
                  >
                    <FlagOutlinedIcon sx={{ fontSize: 14 }} />
                  </button>
                </div>
              </div>

              {reportingId === id && (
                <div className="flex flex-col gap-1 rounded-card bg-surface-sunken p-2">
                  <span className="text-xs font-medium text-ink">
                    {DISH_LABELS.reportPrompt}
                  </span>
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => {
                        onReport?.(id, reason.value);
                        setReportingId(null);
                      }}
                      className="rounded px-2 py-1 text-left text-xs text-ink hover:bg-surface-sunken"
                    >
                      {reason.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setReportingId(null)}
                    className="rounded px-2 py-1 text-left text-xs text-ink-muted hover:bg-surface-sunken"
                  >
                    {DISH_LABELS.cancel}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default DishPhotoGallery;
