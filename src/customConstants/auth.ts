import { AuthProviderInterface } from "@/interfaces/auth";

/**
 * Third-party sign-in.
 *
 * The design has "Continue with Google" and "Continue with Apple" above the
 * email form, and everything that draws them is built: give this array an
 * entry and the buttons and the "or continue with email" divider appear.
 *
 * It is empty because the backend has no OAuth endpoint. `login(username,
 * password)` is the only auth mutation there is, so a Google button today
 * would open nothing — and a dead control at the front door is worse than an
 * absent one. This is the same reason the sign-in page carries no "Forgot
 * password?" link: it used to, pointing at "/".
 *
 * Turning it on needs, per provider: an OAuth client, a backend route that
 * verifies the provider's token and issues our own session cookie, and a
 * find-or-create against `users` keyed on the verified email.
 */
export const AUTH_PROVIDERS: readonly AuthProviderInterface[] = [];
