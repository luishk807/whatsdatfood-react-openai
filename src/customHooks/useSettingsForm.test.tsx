import { act, renderHook, waitFor } from "@testing-library/react";
import useSettingsForm from "@/customHooks/useSettingsForm";

/**
 * The save behaviour the old settings page got wrong three ways.
 *
 * One "Save changes" button floated between two unrelated cards, it was
 * always enabled so pressing it on an untouched page sent a mutation that
 * changed nothing, and a failure left the reader looking at an error with no
 * promise their typing had survived it.
 */
const start = (save = jest.fn().mockResolvedValue(true)) => {
  const rendered = renderHook(() =>
    useSettingsForm({ email: "a@b.test", phone: "" }, save),
  );

  return { ...rendered, save };
};

describe("knowing whether there is anything to save", () => {
  it("cannot be saved before anything is touched", () => {
    const { result } = start();

    expect(result.current.canSave).toBe(false);
  });

  it("can be saved once a field changes", () => {
    const { result } = start();

    act(() => result.current.set("email")("c@d.test"));

    expect(result.current.canSave).toBe(true);
  });

  it("cannot be saved after a change is typed back", () => {
    // Compared against what was loaded rather than tracked as a flag. A flag
    // would claim there is something to save when there is not.
    const { result } = start();

    act(() => result.current.set("email")("c@d.test"));
    act(() => result.current.set("email")("a@b.test"));

    expect(result.current.canSave).toBe(false);
  });

  it("sends nothing when there is nothing to send", async () => {
    const { result, save } = start();

    await act(async () => {
      await result.current.submit();
    });

    expect(save).not.toHaveBeenCalled();
  });
});

describe("saving", () => {
  it("passes the current values", async () => {
    const { result, save } = start();

    act(() => result.current.set("phone")("555"));
    await act(async () => {
      await result.current.submit();
    });

    expect(save).toHaveBeenCalledWith({ email: "a@b.test", phone: "555" });
  });

  it("says so afterwards", async () => {
    const { result } = start();

    act(() => result.current.set("phone")("555"));
    await act(async () => {
      await result.current.submit();
    });

    await waitFor(() => expect(result.current.state).toBe("saved"));
  });

  it("disables itself again without a refetch", async () => {
    const { result } = start();

    act(() => result.current.set("phone")("555"));
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.canSave).toBe(false);
  });

  it("clears a stale 'saved' as soon as something changes again", async () => {
    // Leaving it up beside an edited field claims the edit is stored.
    const { result } = start();

    act(() => result.current.set("phone")("555"));
    await act(async () => {
      await result.current.submit();
    });

    act(() => result.current.set("phone")("556"));

    expect(result.current.state).toBe("idle");
  });
});

describe("when saving fails", () => {
  const failing = () => jest.fn().mockRejectedValue(new Error("offline"));

  it("says it failed", async () => {
    const { result } = start(failing());

    act(() => result.current.set("email")("c@d.test"));
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.state).toBe("failed");
  });

  it("keeps every value that was typed", async () => {
    // The load-bearing one. Somebody who just typed a new email and lost
    // their connection must not also lose the email.
    const { result } = start(failing());

    act(() => result.current.set("email")("c@d.test"));
    act(() => result.current.set("phone")("555"));
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.values).toEqual({
      email: "c@d.test",
      phone: "555",
    });
  });

  it("leaves the form saveable so trying again is the whole recovery", async () => {
    const { result } = start(failing());

    act(() => result.current.set("email")("c@d.test"));
    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.canSave).toBe(true);
  });
});

describe("loading from the server", () => {
  it("makes what arrived the new baseline", () => {
    const { result } = start();

    act(() => result.current.reset({ email: "z@z.test", phone: "1" }));

    expect(result.current.values.email).toBe("z@z.test");
    expect(result.current.canSave).toBe(false);
  });
});
