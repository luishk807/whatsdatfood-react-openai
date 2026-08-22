import { Link } from "react-router-dom";
import { SITE_LABELS, LEGAL_LABELS } from "@/customConstants/labels";
import { ROUTES } from "@/customConstants/routes";

/**
 * Small on purpose.
 *
 * This replaced a footer that rendered the literal words "Footer" and
 * "Contact" - placeholder text that shipped. Everything here goes somewhere:
 * no About or How it works link until there is a page behind it. Privacy and
 * Terms are now written and linked, which they had to be before strangers
 * upload photographs - the terms are where the licence to display those
 * photographs comes from.
 */
const Footer = () => (
  <footer className="min-h-[var(--height-footer)] border-t border-line bg-surface">
    <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-ink">{SITE_LABELS.brand}</p>
        <p className="text-ink-muted">{SITE_LABELS.tagline}</p>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-ink-muted">
        <Link to={ROUTES.privacy} className="hover:text-ink">
          {LEGAL_LABELS.privacy}
        </Link>
        <Link to={ROUTES.terms} className="hover:text-ink">
          {LEGAL_LABELS.terms}
        </Link>
        {/* A page rather than a mailto:. That link opens nothing at all on a
            phone with no mail client configured, and on a shared computer it
            loses the message entirely. */}
        <Link to={ROUTES.contact} className="hover:text-ink">
          {SITE_LABELS.contact}
        </Link>
        <span>{SITE_LABELS.copyright}</span>
      </div>
    </div>
  </footer>
);

export default Footer;
