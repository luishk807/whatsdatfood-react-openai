import { type FC, useEffect, useMemo, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import SettingsField from "@/components/SettingsField";
import useRestaurantOwnership from "@/customHooks/useRestaurantOwnership";
import { CLAIM_LABELS } from "@/customConstants/labels";
import { CLAIM_LIMITS, CLAIM_ROLES } from "@/customConstants/ownership";
import {
  ClaimWizardInterface,
  VerificationMethodType,
} from "@/interfaces/ownership";

/**
 * Claiming a restaurant, as the several questions it actually is.
 *
 * It was one button that submitted a slug and nothing else. The server has
 * always accepted a role, a name, a business email, a phone and an
 * explanation - everything a reviewer needs to decide - and none of it could
 * be entered, so every claim arrived as "this person pressed a button" and a
 * moderator had to approve or refuse on that.
 *
 * **The verification methods come from the server**, never from a list here.
 * Only `manual` is enabled today; a code-based method turned on later appears
 * in this wizard with the right fields and no frontend release, because
 * `collects` drives which questions are asked. That is the same reasoning
 * that keeps point values out of the reputation constants.
 *
 * **It says what happens next.** This is the one flow where somebody hands
 * over their name and their business email and then waits for a stranger to
 * decide, so a form that closes silently is a form that looks like it did
 * nothing. The last screen says a person will look at it.
 *
 * **Nothing here grants anything.** Submitting creates a pending claim; the
 * server re-checks an approved claim on that specific restaurant for every
 * owner action regardless of what this screen ever showed.
 */
const ClaimWizard: FC<ClaimWizardInterface> = ({
  slug,
  restaurantName,
  open,
  onClose,
  onSubmitted,
}) => {
  const { claim, claiming, loadVerificationMethods } = useRestaurantOwnership();

  const [methods, setMethods] = useState<VerificationMethodType[] | null>(null);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string>(CLAIM_ROLES[0].value);
  const [form, setForm] = useState({
    claimantName: "",
    businessEmail: "",
    businessPhone: "",
    explanation: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let live = true;

    loadVerificationMethods(slug).then((found) => {
      if (live) {
        setMethods(found);
      }
    });

    return () => {
      live = false;
    };
  }, [open, slug, loadVerificationMethods]);

  const method = methods?.[0];
  const collects = useMemo(() => method?.collects ?? [], [method]);
  const asks = (field: string) => collects.includes(field);

  const set = (key: keyof typeof form) => (value: string) => {
    setError(null);
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const submit = async () => {
    // Checked here so the common omissions cost no round trip. The server
    // decides, and its refusals are shown verbatim when they come.
    if (asks("claimant_name") && !form.claimantName.trim()) {
      setError(CLAIM_LABELS.requiredName);
      return;
    }

    if (
      (asks("business_email") || asks("business_phone")) &&
      !form.businessEmail.trim() &&
      !form.businessPhone.trim()
    ) {
      setError(CLAIM_LABELS.requiredContact);
      return;
    }

    try {
      await claim({
        slug,
        role,
        verificationMethod: method?.key ?? "manual",
        claimantName: form.claimantName.trim(),
        businessEmail: form.businessEmail.trim(),
        businessPhone: form.businessPhone.trim(),
        explanation: form.explanation.trim(),
      });

      setSent(true);
      onSubmitted();
    } catch (caught) {
      // Server refusals are shown as they came. Each one explains a rule -
      // already claimed, not a valid role - and rewording it here turns an
      // explanation into a shrug.
      setError(
        caught instanceof Error ? caught.message : CLAIM_LABELS.failed,
      );
    }
  };

  const title = sent ? CLAIM_LABELS.sentTitle : CLAIM_LABELS.title;

  return (
    <BottomSheet open={open} title={title} onClose={onClose}>
      {sent ? (
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-sm text-ink-muted">{CLAIM_LABELS.sentBody}</p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 self-start rounded-pill border border-ink px-4 text-sm font-medium text-ink"
          >
            {CLAIM_LABELS.close}
          </button>
        </div>
      ) : methods && !methods.length ? (
        // No enabled provider. Saying so beats a form that cannot be
        // submitted, which is the dead-button problem one screen along.
        <p className="pb-2 text-sm text-ink-muted">{CLAIM_LABELS.noMethods}</p>
      ) : (
        <div className="flex flex-col gap-5 pb-2">
          <p className="text-sm text-ink-muted">
            {restaurantName
              ? `${CLAIM_LABELS.intro} (${restaurantName})`
              : CLAIM_LABELS.intro}
          </p>

          {step === 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium text-ink">
                {CLAIM_LABELS.roleStep}
              </legend>

              {CLAIM_ROLES.map((option) => (
                <label
                  key={option.value}
                  className="flex min-h-14 cursor-pointer items-start gap-3 rounded-card border border-line p-3"
                >
                  <input
                    type="radio"
                    name="claim-role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={() => setRole(option.value)}
                    className="mt-1"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">
                      {option.label}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {option.blurb}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-ink">
                  {CLAIM_LABELS.detailsStep}
                </p>
                {method?.blurb && (
                  <p className="text-xs text-ink-muted">{method.blurb}</p>
                )}
              </div>

              {/* Driven by what the method says it collects, so a provider
                  enabled later asks for its own fields without a change
                  here. */}
              {asks("claimant_name") && (
                <SettingsField
                  name="claimant_name"
                  label={CLAIM_LABELS.nameLabel}
                  hint={CLAIM_LABELS.nameHint}
                  value={form.claimantName}
                  onChange={set("claimantName")}
                />
              )}

              {asks("business_email") && (
                <SettingsField
                  name="business_email"
                  type="email"
                  label={CLAIM_LABELS.emailLabel}
                  hint={CLAIM_LABELS.emailHint}
                  value={form.businessEmail}
                  onChange={set("businessEmail")}
                />
              )}

              {asks("business_phone") && (
                <SettingsField
                  name="business_phone"
                  type="tel"
                  label={CLAIM_LABELS.phoneLabel}
                  value={form.businessPhone}
                  onChange={set("businessPhone")}
                />
              )}

              {asks("explanation") && (
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm text-ink">
                    {CLAIM_LABELS.explanationLabel}
                  </span>
                  <textarea
                    name="explanation"
                    rows={4}
                    maxLength={CLAIM_LIMITS.MAX_EXPLANATION}
                    value={form.explanation}
                    onChange={(event) => set("explanation")(event.target.value)}
                    className="w-full rounded-card border border-line bg-surface-raised px-3 py-2 text-base text-ink"
                  />
                  <span className="text-xs text-ink-muted">
                    {CLAIM_LABELS.explanationHint}
                  </span>
                </label>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-11 rounded-pill border border-line px-4 text-sm text-ink"
              >
                {CLAIM_LABELS.back}
              </button>
            )}

            {step === 0 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-11 rounded-pill bg-brand px-5 text-sm font-medium text-white hover:bg-brand-strong"
              >
                {CLAIM_LABELS.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={claiming}
                className="min-h-11 rounded-pill bg-brand px-5 text-sm font-medium text-white hover:bg-brand-strong disabled:opacity-60"
              >
                {claiming ? CLAIM_LABELS.submitting : CLAIM_LABELS.submit}
              </button>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
};

export default ClaimWizard;
