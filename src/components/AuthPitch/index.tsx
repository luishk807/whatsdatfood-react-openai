import { type FC, useCallback, useState } from "react";
import useRecentDishPhotos from "@/customHooks/useRecentDishPhotos";
import { AUTH_LABELS } from "@/customConstants/labels";
import { AUTH_PITCH } from "@/customConstants/images";

/**
 * The half of an auth page that is not a form.
 *
 * Sign-in was a form centred in an empty page, which says nothing about what
 * signing in is for. This is the same argument the home page makes — the
 * product is photographs of food — made with the actual photographs on the
 * platform rather than stock imagery.
 *
 * It degrades to the words alone. A new deployment has no photos at all, and a
 * grid of grey rectangles behind a sign-in form is worse than a plain panel.
 */
const AuthPitch: FC = () => {
  const { photos } = useRecentDishPhotos(AUTH_PITCH.FETCH);

  // Third-party hosts 403 often enough that a broken tile here is a normal
  // outcome, and a broken-image icon on the sign-in page is a worse first
  // impression than a plain panel. More are fetched than are shown so a refusal
  // is covered by the next photo rather than leaving a hole.
  const [broken, setBroken] = useState<ReadonlySet<string>>(() => new Set());
  const drop = useCallback((id: string) => {
    setBroken((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const shown = photos
    .filter((photo) => !broken.has(String(photo.id)))
    .slice(0, AUTH_PITCH.COUNT);

  return (
    <section
      aria-hidden="true"
      className="relative flex h-full w-full flex-col justify-end overflow-hidden bg-brand-soft p-8"
    >
      {shown.length === AUTH_PITCH.COUNT && (
        <div className="absolute inset-0 grid grid-cols-2 gap-1">
          {shown.map((photo) => (
            <img
              key={photo.id}
              src={photo.url_s || photo.url_m || ""}
              alt=""
              loading="lazy"
              decoding="async"
              onError={() => drop(String(photo.id))}
              className="h-full w-full object-cover"
            />
          ))}
        </div>
      )}

      {/* Legible over any photograph, and over the plain panel when there is
          none. A scrim rather than a per-image treatment: the photos underneath
          are whatever the community happened to upload. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

      <div className="relative flex flex-col gap-2">
        <p className="text-3xl font-semibold leading-tight tracking-tight text-white">
          {AUTH_LABELS.pitchTitle}
        </p>
        <p className="max-w-xs text-base text-white/85">
          {AUTH_LABELS.pitchBody}
        </p>
      </div>
    </section>
  );
};

export default AuthPitch;
