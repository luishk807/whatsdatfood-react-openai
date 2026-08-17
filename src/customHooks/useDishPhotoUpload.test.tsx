import { act, renderHook, waitFor } from "@testing-library/react";
import useDishPhotoUpload from "@/customHooks/useDishPhotoUpload";
import { DISH_LABELS } from "@/customConstants/labels";
import { MenuItemType } from "@/interfaces/restaurants";

const prepareUpload = jest.fn();
const auth = { user: { id: 7 } as unknown };

jest.mock("@/customHooks/useAuth", () => ({
  __esModule: true,
  default: () => auth,
}));

jest.mock("@/utils/image", () => ({
  __esModule: true,
  prepareUpload: (file: File) => prepareUpload(file),
}));

const dish = (id: number) => ({ id, name: "Plain Pie" }) as unknown as MenuItemType;

const photo = () => new File(["bytes"], "IMG_0001.HEIC", { type: "image/heic" });

const ok = () =>
  ({ ok: true, json: async () => ({}) }) as unknown as Response;

const refused = (message?: string) =>
  ({
    ok: false,
    json: async () =>
      message ? { errors: [{ message }] } : Promise.reject(new Error("no body")),
  }) as unknown as Response;

describe("useDishPhotoUpload", () => {
  beforeEach(() => {
    auth.user = { id: 7 };
    prepareUpload.mockReset().mockResolvedValue(new Blob(["small"]));
    global.fetch = jest.fn().mockResolvedValue(ok());
  });

  describe("who may upload", () => {
    it("refuses when signed out, and says why", async () => {
      auth.user = null;
      const { result } = renderHook(() => useDishPhotoUpload());

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.upload(dish(1), photo());
      });

      expect(sent).toBe(false);
      expect(result.current.canUpload).toBe(false);
      expect(result.current.error).toBe(DISH_LABELS.signInToUpload);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("refuses a dish with no id rather than posting to nowhere", async () => {
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload({ name: "Ghost" } as MenuItemType, photo());
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("sending", () => {
    it("shrinks the photo before it leaves the phone", async () => {
      // A 12MP phone photo is ~4MB; on restaurant wifi that is the difference
      // between an upload that finishes and one that is abandoned.
      const file = photo();
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload(dish(1), file);
      });

      expect(prepareUpload).toHaveBeenCalledWith(file);
    });

    it("posts multipart to the dish, not through GraphQL", async () => {
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload(dish(42), photo());
      });

      const [url, init] = (global.fetch as jest.Mock).mock.calls[0];

      // Image bytes have no business inside a JSON transport.
      expect(url).toContain("/uploads/dish/42");
      expect(init.method).toBe("POST");
      expect(init.body).toBeInstanceOf(FormData);
      expect((init.body as FormData).get("file")).toBeTruthy();
    });

    it("sends the session cookie, which is what authorises it", async () => {
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload(dish(1), photo());
      });

      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      expect(init.credentials).toBe("include");
    });

    it("reports which dish is uploading, then stops", async () => {
      let release: (value: Response) => void = () => undefined;
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => (release = resolve)),
      );

      const { result } = renderHook(() => useDishPhotoUpload());

      act(() => {
        result.current.upload(dish(9), photo());
      });

      // The tile needs to show progress on the dish it belongs to.
      await waitFor(() => expect(result.current.uploadingDishId).toBe(9));

      await act(async () => release(ok()));
      await waitFor(() => expect(result.current.uploadingDishId).toBeNull());
    });
  });

  describe("when it fails", () => {
    it("surfaces the backend's reason", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        refused("That photo cannot be published here"),
      );
      const { result } = renderHook(() => useDishPhotoUpload());

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.upload(dish(1), photo());
      });

      // Screening rejects with a reason; the person deserves to see it.
      expect(sent).toBe(false);
      expect(result.current.error).toBe("That photo cannot be published here");
    });

    it("falls back to a readable message when there is no reason", async () => {
      (global.fetch as jest.Mock).mockResolvedValue(refused());
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload(dish(1), photo());
      });

      expect(result.current.error).toBe(DISH_LABELS.uploadFailed);
    });

    it("survives the network dropping mid-upload", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("offline"));
      const { result } = renderHook(() => useDishPhotoUpload());

      let sent: boolean | undefined;
      await act(async () => {
        sent = await result.current.upload(dish(1), photo());
      });

      expect(sent).toBe(false);
      expect(result.current.error).toBe(DISH_LABELS.uploadFailed);
      expect(result.current.uploadingDishId).toBeNull();
    });

    it("survives a photo the browser cannot decode", async () => {
      prepareUpload.mockRejectedValue(new Error("not an image"));
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload(dish(1), photo());
      });

      expect(result.current.error).toBe(DISH_LABELS.uploadFailed);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("stops showing an error once it is dismissed", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("offline"));
      const { result } = renderHook(() => useDishPhotoUpload());

      await act(async () => {
        await result.current.upload(dish(1), photo());
      });
      expect(result.current.error).toBeTruthy();

      act(() => result.current.clearError());

      expect(result.current.error).toBeNull();
    });
  });
});
