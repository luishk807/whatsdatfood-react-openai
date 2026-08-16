import { useCallback, useState } from "react";
import { MenuItemType } from "@/interfaces/restaurants";
import { BACKEND_URL } from "@/customConstants";
import { DISH_LABELS } from "@/customConstants/labels";
import { prepareUpload } from "@/utils/image";
import useAuth from "@/customHooks/useAuth";

interface UploadState {
  uploadingDishId: number | null;
  error: string | null;
}

/**
 * Sends a dish photo.
 *
 * The file goes as multipart to the REST endpoint rather than through GraphQL —
 * image bytes have no business inside a JSON transport — and is resized in the
 * browser first so a 4MB phone photo leaves as roughly 400KB.
 */
const useDishPhotoUpload = () => {
  const { user } = useAuth();
  const [state, setState] = useState<UploadState>({
    uploadingDishId: null,
    error: null,
  });

  const upload = useCallback(
    async (item: MenuItemType, file: File): Promise<boolean> => {
      const dishId = Number(item?.id ?? 0);

      if (!dishId || !user) {
        setState({ uploadingDishId: null, error: DISH_LABELS.signInToUpload });
        return false;
      }

      setState({ uploadingDishId: dishId, error: null });

      try {
        const prepared = await prepareUpload(file);
        const body = new FormData();
        body.append("file", prepared, "dish.jpg");

        const response = await fetch(`${BACKEND_URL}/uploads/dish/${dishId}`, {
          method: "POST",
          body,
          credentials: "include", // the session cookie authorises the upload
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          const message =
            payload?.errors?.[0]?.message ?? DISH_LABELS.uploadFailed;
          setState({ uploadingDishId: null, error: message });
          return false;
        }

        setState({ uploadingDishId: null, error: null });
        return true;
      } catch {
        setState({ uploadingDishId: null, error: DISH_LABELS.uploadFailed });
        return false;
      }
    },
    [user],
  );

  const clearError = useCallback(
    () => setState((prev) => ({ ...prev, error: null })),
    [],
  );

  return {
    upload,
    clearError,
    uploadingDishId: state.uploadingDishId,
    error: state.error,
    canUpload: !!user,
  };
};

export default useDishPhotoUpload;
