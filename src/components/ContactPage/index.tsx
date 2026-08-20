import { type FC, type FormEvent, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  CONTACT_AVAILABLE,
  SEND_CONTACT_MESSAGE,
} from "@/graphql/queries/contact";
import { CONTACT } from "@/customConstants";
import { CONTACT_LABELS } from "@/customConstants/labels";
import { _get } from "@/utils";

/**
 * Somewhere to write to that is not a `mailto:` link.
 *
 * The footer offered one of those, which opens nothing at all on a phone with
 * no mail client configured and loses the message entirely on a shared
 * computer. A form works everywhere and, more usefully, arrives somewhere we
 * can actually answer from.
 *
 * **No account needed.** Somebody reporting that a menu is wrong, or that
 * their restaurant is listed with the wrong address, is precisely the person
 * least likely to have signed up.
 *
 * **When the server cannot send, the page says so and gives an address.** The
 * same rule as the map with no token: a form that fails on submit wastes
 * somebody's message and their time, and there is no version of this where
 * showing it anyway is kinder.
 */
const ContactPage: FC = () => {
  const { data } = useQuery(CONTACT_AVAILABLE, { fetchPolicy: "cache-first" });
  const [send] = useMutation(SEND_CONTACT_MESSAGE);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  // The honeypot. Never shown, never focusable, never announced — so anything
  // in it was put there by something that reads markup rather than pages.
  const [website, setWebsite] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = _get<boolean>(data, "contactAvailable", true);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSending(true);

    try {
      await send({
        variables: {
          input: { name, email, subject, message, website },
        },
      });
      setSent(true);
    } catch (thrown) {
      // Verbatim. "That email address does not look right" and "that is a lot
      // of messages, try again later" each explain a rule; "something went
      // wrong" explains none of them.
      setError(
        thrown instanceof Error ? thrown.message : CONTACT_LABELS.failed,
      );
    } finally {
      setSending(false);
    }
  };

  const field =
    "h-12 w-full rounded-card border border-line bg-surface-raised px-3 text-base text-ink";

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 pb-16 pt-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {CONTACT_LABELS.title}
        </h1>
        <p className="text-sm leading-relaxed text-ink-muted">
          {CONTACT_LABELS.blurb}
        </p>
      </header>

      {sent ? (
        /* Says what happens next rather than only that it worked. The receipt
           is the part somebody can check, so it is worth naming. */
        <div
          role="status"
          className="flex flex-col gap-1 rounded-card border border-line bg-surface-sunken p-4"
        >
          <p className="text-sm font-medium text-ink">{CONTACT_LABELS.sent}</p>
          <p className="text-sm text-ink-muted">{CONTACT_LABELS.sentHelp}</p>
        </div>
      ) : !available ? (
        <p className="rounded-card border border-dashed border-line p-4 text-sm text-ink-muted">
          {CONTACT_LABELS.unavailable}{" "}
          <a
            href={`mailto:${CONTACT.FALLBACK_EMAIL}`}
            className="text-ink underline underline-offset-4"
          >
            {CONTACT.FALLBACK_EMAIL}
          </a>
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              {CONTACT_LABELS.name}
            </span>
            <input
              required
              value={name}
              maxLength={CONTACT.MAX_NAME}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              {CONTACT_LABELS.email}
            </span>
            <input
              required
              type="email"
              value={email}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              {CONTACT_LABELS.subject}
            </span>
            <input
              required
              value={subject}
              maxLength={CONTACT.MAX_SUBJECT}
              onChange={(event) => setSubject(event.target.value)}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">
              {CONTACT_LABELS.message}
            </span>
            <textarea
              required
              rows={6}
              value={message}
              maxLength={CONTACT.MAX_MESSAGE}
              onChange={(event) => setMessage(event.target.value)}
              className="w-full rounded-card border border-line bg-surface-raised px-3 py-2 text-base leading-relaxed text-ink"
            />
          </label>

          {/* Hidden from sighted readers, from screen readers and from the tab
              order alike. `display:none` rather than an off-screen position:
              anything a person could conceivably reach is a field a person
              could conceivably fill in by accident, and that would silently
              throw their message away. */}
          <div style={{ display: "none" }} aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="min-h-12 rounded-pill bg-ink px-5 text-sm font-medium text-surface disabled:opacity-60"
          >
            {sending ? CONTACT_LABELS.sending : CONTACT_LABELS.submit}
          </button>
        </form>
      )}
    </section>
  );
};

export default ContactPage;
