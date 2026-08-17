import { type FC } from "react";
import { LegalPageInterface } from "@/interfaces/legal";
import { LEGAL_EFFECTIVE } from "@/customConstants/legal";
import { LEGAL_LABELS } from "@/customConstants/labels";

/**
 * A legal document, rendered from structure rather than a wall of markup.
 *
 * Prose width is capped: these are the only pages in the product somebody
 * actually reads a paragraph of, and a policy set the full width of a desktop
 * screen is one nobody finishes.
 */
const LegalPage: FC<LegalPageInterface> = ({ title, intro, sections }) => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-16 pt-8">
    <header className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-ink-muted">{intro}</p>
      <p className="text-xs text-ink-muted">
        {LEGAL_LABELS.effective(LEGAL_EFFECTIVE)}
      </p>
    </header>

    {sections.map((section) => (
      <section key={section.heading} className="flex flex-col gap-2">
        <h2 className="text-base font-semibold text-ink">{section.heading}</h2>

        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-ink-muted">
            {paragraph}
          </p>
        ))}

        {section.bullets && (
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="text-sm leading-relaxed text-ink-muted">
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </section>
    ))}
  </div>
);

export default LegalPage;
