import { useCallback, useState } from "react";
import { MenuItemType } from "@/interfaces/restaurants";
import { BACKEND_URL } from "@/customConstants";
import { DISH_LABELS } from "@/customConstants/labels";
import { prepareUpload } from "@/utils/image";
import useAuth from "@/customHooks/useAuth";
import { FoodCredEarnedType } from "@/interfaces/reputation";

interface UploadState {
  uploadingDishId: number | null;
  error: string | null;
  /**
   * What the upload earned, straight off the response.
   *
   * Carried back rather than fetched afterwards: the server already knows, and
   * a second round trip would land the number after the contributor has
   * stopped looking. Null for a duplicate, which earns nothing and so has
   * nothing to announce.
   */
  award: FoodCredEarnedType | null;
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
    award: null,
  });

  const upload = useCallback(
    async (item: MenuItemType, file: File): Promise<boolean> => {
      const dishId = Number(item?.id ?? 0);

      if (!dishId || !user) {
        setState({
          uploadingDishId: null,
          error: DISH_LABELS.signInToUpload,
          award: null,
        });
        return false;
      }

      setState({ uploadingDishId: dishId, error: null, award: null });

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
          setState({ uploadingDishId: null, error: message, award: null });
          return false;
        }

        const result = await response.json().catch(() => null);
        const award: FoodCredEarnedType | null = result?.food_cred ?? null;

        setState({
          uploadingDishId: null,
          error: null,
          // Nothing earned is nothing to say. A duplicate upload succeeded, so
          // it must not read as a failure, but it is not a contribution
          // either and announcing "+0" would claim otherwise.
          award: award && award.earned > 0 ? award : null,
        });
        return true;
      } catch {
        setState({
          uploadingDishId: null,
          error: DISH_LABELS.uploadFailed,
          award: null,
        });
        return false;
      }
    },
    [user],
  );

  const clearError = useCallback(
    () => setState((prev) => ({ ...prev, error: null })),
    [],
  );

  const clearAward = useCallback(
    () => setState((prev) => ({ ...prev, award: null })),
    [],
  );

  return {
    upload,
    clearError,
    clearAward,
    uploadingDishId: state.uploadingDishId,
    error: state.error,
    award: state.award,
    canUpload: !!user,
  };
};

export default useDishPhotoUpload;
