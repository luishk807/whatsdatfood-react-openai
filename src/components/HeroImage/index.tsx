import { type FC, useEffect, useState } from "react";
import clsx from "clsx";
import { IMAGERY_LABELS } from "@/customConstants/labels";
import { heroNeedsCredit, isCommunityHero } from "@/utils/heroImage";
import { HeroImageInterface } from "@/interfaces/imagery";

/**
 * A large decorative panel with a photograph in it.
 *
 * Deliberately generic. It takes an already-chosen image — see
 * `utils/heroImage.ts` for the hierarchy — draws it full bleed, lays a scrim
 * over it and renders whatever the caller puts on top. The auth pages are the
 * first users; nothing here knows about signing in.
 *
 * **The text stays readable over any photograph.** The scrim is a fixed
 * gradient rather than something derived per image, because the photographs
 * underneath are whatever the community happened to upload and half of them
 * are bright. It is opaque enough at the bottom that white type clears WCAG AA
 * against a white photograph, and the panel keeps its brand ground underneath
 * so the same treatment works when there is no image at all.
 *
 * **A photograph fades in rather than appearing.** The box is painted first,
 * the image arrives over it — no spinner, no flash, and no layout shift
 * because the panel was already the size it is. Reduced motion skips the
 * transition; the design system honours that globally, and this is one of the
 * few places with an animation of its own.
 *
 * **A refusal falls back to the panel**, which is a designed state rather than
 * a failure. Third-party hosts 403 constantly and a broken image on a sign-in
 * page is a worse first impression than a plain green field.
 */
const HeroImage: FC<HeroImageInterface> = ({
  image,
  children,
  className,
  eager = false,
}) => {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // A different image in the same panel starts again, rather than staying
  // faded-out or stuck on a previous failure.
  useEffect(() => {
    setBroken(false);
    setLoaded(false);
  }, [image?.url]);

  const showing = image && !broken;

  return (
    <section
      // Decorative in full: the page's real heading is in the form beside it,
      // and the words rendered here are repeated there. Announcing the panel
      // would read the pitch twice.
      aria-hidden="true"
      className={clsx(
        "relative flex h-full w-full flex-col justify-end overflow-hidden bg-brand-soft",
        className,
      )}
    >
      {showing && (
        <img
          src={image.url}
          alt={image.alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={clsx(
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 motion-reduce:transition-none",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {/* Strongest where the type sits. Present with or without a photograph,
          so the panel looks the same either way. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      {/* Tighter on the short band a phone gets, where 32px of padding and
          a headline leave no room for the photograph. */}
      <div className="relative flex flex-col gap-1 p-5 sm:gap-2 sm:p-8">
        {children}
      </div>

      {/* Required, not decorative: Unsplash's terms ask for the photographer
          wherever the photo appears, and a contributor's name is theirs.
          A community photo names the dish as well — a curated one never does,
          because it is not a photograph of anything we know about. */}
      {showing && heroNeedsCredit(image) && (
        <p className="relative px-5 pb-3 text-[10px] leading-tight text-white/70 sm:px-8 sm:pb-6 sm:text-[11px]">
          {isCommunityHero(image)
            ? [image.caption, `@${image.credit!.text}`]
                .filter(Boolean)
                .join(" · ")
            : IMAGERY_LABELS.photoBy(image.credit!.text)}
        </p>
      )}
    </section>
  );
};

export default HeroImage;
