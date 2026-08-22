import { useCallback, useState } from "react";
import { BACKEND_URL } from "@/customConstants";
import { SETTINGS_LABELS } from "@/customConstants/labels";
import { prepareUpload } from "@/utils/image";

/**
 * Setting the photograph on your own account.
 *
 * **The same preparation as a dish photo.** `prepareUpload` resizes and
 * square-crops in the browser before anything is sent, so a 12MP phone
 * picture goes as roughly a tenth of its size - which on restaurant wifi is
 * the difference between an upload that finishes and one that is abandoned.
 * A second implementation of that would be a second place to forget it.
 *
 * **No id in the request.** The endpoint sets the avatar on whoever the
 * session cookie belongs to, so there is no path where a client could name
 * somebody else's account.
 *
 * **Earns nothing.** Reputation is for photographing food and being useful to
 * other people; a picture of yourself is neither, and awarding Food Cred for
 * one would make the leaderboard partly a measure of who filled in their
 * profile.
 */
const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const prepared = await prepareUpload(file);
      const body = new FormData();
      body.append("file", prepared, "avatar.jpg");

      const response = await fetch(`${BACKEND_URL}/uploads/avatar`, {
        method: "POST",
        body,
        credentials: "include", // the session cookie is the authorisation
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        // Server refusals are shown as they came: "That photo cannot be
        // published here" explains a rule, where a generic failure explains
        // nothing and invites the same upload again.
        setError(
          payload?.errors?.[0]?.message ?? SETTINGS_LABELS.photoFailed,
        );
        return null;
      }

      const result = await response.json().catch(() => null);

      return (result?.avatar_url as string) ?? null;
    } catch {
      setError(SETTINGS_LABELS.photoFailed);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, error };
};

export default useAvatarUpload;
