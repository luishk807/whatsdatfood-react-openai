import { useCallback, useState } from "react";
import { BACKEND_URL } from "@/customConstants";
import { MENU_MISSING_LABELS } from "@/customConstants/labels";
import useAuth from "@/customHooks/useAuth";

/**
 * Sending a photograph of a menu.
 *
 * **Deliberately not `prepareUpload`.** The dish path resizes and square-crops
 * in the browser, which is right for a 12MP photo of a plate and destructive
 * here — a menu board cropped to its short edge loses the menu. The file goes
 * up whole and the server keeps the aspect ratio; the size limit is the
 * server's to enforce, and it says so plainly when a photo is too large.
 *
 * **It publishes nothing.** The response says the photograph is waiting to be
 * reviewed, which is what the page then tells the contributor — promising it
 * is live when it is queued is a promise that breaks the next time they look.
 */
const useMenuPhotoUpload = (slugOrId: string | number | undefined) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);

  const upload = useCallback(
    async (file: File | null) => {
      if (!file || !slugOrId) {
        return false;
      }

      if (!user?.id) {
        setError(MENU_MISSING_LABELS.signInToUpload);

        return false;
      }

      setUploading(true);
      setError(null);

      try {
        const body = new FormData();
        body.append("file", file, "menu.jpg");

        const response = await fetch(
          `${BACKEND_URL}/uploads/menu/${slugOrId}`,
          {
            method: "POST",
            body,
            credentials: "include", // the session cookie authorises the upload
          },
        );

        if (!response.ok) {
          const payload = await response.json().catch(() => null);

          // The server's own words: "that photo is too large", "that file is
          // not an image we can read". Each explains what to do differently,
          // and a generic failure explains none of them.
          setError(
            payload?.detail ??
              payload?.errors?.[0]?.message ??
              MENU_MISSING_LABELS.uploadFailed,
          );

          return false;
        }

        setQueued(true);

        return true;
      } catch {
        setError(MENU_MISSING_LABELS.uploadFailed);

        return false;
      } finally {
        setUploading(false);
      }
    },
    [slugOrId, user?.id],
  );

  return { upload, uploading, error, queued };
};

export default useMenuPhotoUpload;
