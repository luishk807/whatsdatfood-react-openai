import { type FC } from "react";
import HeroImage from "@/components/HeroImage";
import useHeroImage from "@/customHooks/useHeroImage";
import { AUTH_LABELS } from "@/customConstants/labels";

/**
 * The half of an auth page that is not a form.
 *
 * Sign-in was a form centred in an empty page, which says nothing about what
 * signing in is for. The food does the explaining — and it is **one
 * photograph** now rather than a 2x2 grid: four thumbnails in a column this
 * tall read as a contact sheet, and the crop on each was too small to make any
 * of them appetising. One image, full bleed, is the shot somebody remembers.
 *
 * **What it draws is decided elsewhere.** `useHeroImage` and
 * `utils/heroImage.ts` own the hierarchy — a diner's photograph first, curated
 * Unsplash second, the plain brand panel when there is neither — and none of
 * that is specific to signing in. This component is the auth copy and nothing
 * more.
 *
 * It still degrades to the words alone. A new deployment has no photographs at
 * all, and a hole behind a sign-in form is worse than a green field.
 */
const AuthPitch: FC = () => {
  const { image } = useHeroImage();

  return (
    <HeroImage
      image={image}
      // The panel is on the screen somebody landed on, so waiting for it to
      // scroll into view is waiting for something that already happened.
      eager
    >
      <p className="text-xl font-semibold leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
        {AUTH_LABELS.pitchTitle}
      </p>
      {/* The band on a phone is 160px tall and the form below repeats this
          promise in its own subtitle, so the second line is desktop only —
          crammed in, it pushed the photograph out of its own panel. */}
      <p className="hidden max-w-xs text-base text-white/85 sm:block">
        {AUTH_LABELS.pitchBody}
      </p>
    </HeroImage>
  );
};

export default AuthPitch;
