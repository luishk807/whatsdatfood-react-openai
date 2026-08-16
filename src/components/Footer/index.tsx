import { SITE_LABELS } from "@/customConstants/labels";

/**
 * Small on purpose.
 *
 * This replaced a footer that rendered the literal words "Footer" and
 * "Contact" - placeholder text that shipped. Everything here goes somewhere:
 * no About or How it works link until there is a page behind it, and no
 * Privacy or Terms until they have been written and reviewed, which they must
 * be before strangers upload photographs.
 */
const Footer = () => (
  <footer className="border-t border-line bg-surface">
    <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">{SITE_LABELS.brand}</p>
        <p className="text-ink-muted">{SITE_LABELS.tagline}</p>
      </div>

      <div className="flex items-center gap-4 text-ink-muted">
        <a
          href="mailto:info@whatsdatfood.com"
          className="hover:text-ink"
        >
          {SITE_LABELS.contact}
        </a>
        <span>{SITE_LABELS.copyright}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
