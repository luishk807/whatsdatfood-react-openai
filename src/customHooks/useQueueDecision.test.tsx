import { act, renderHook, waitFor } from "@testing-library/react";
import useQueueDecision from "@/customHooks/useQueueDecision";

describe("useQueueDecision", () => {
  it("names the row that is working, not merely that something is", async () => {
    // Disabling the whole queue while one claim resolves leaves a moderator
    // waiting on a request they cannot see.
    let release = () => {};
    const decide = jest.fn(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    const { result } = renderHook(() => useQueueDecision(decide));

    act(() => {
      result.current.run("row-2", true);
    });

    await waitFor(() => expect(result.current.busyId).toBe("row-2"));

    await act(async () => {
      release();
    });

    expect(result.current.busyId).toBeNull();
  });

  it("ignores a second click on a row already deciding", async () => {
    // Every queue used to fire and forget, so nothing changed until the page
    // reloaded and clicking again was the natural response.
    let release = () => {};
    const decide = jest.fn(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    const { result } = renderHook(() => useQueueDecision(decide));

    act(() => {
      result.current.run("row-1", true);
    });
    await waitFor(() => expect(result.current.busyId).toBe("row-1"));

    await act(async () => {
      result.current.run("row-1", true);
      release();
    });

    expect(decide).toHaveBeenCalledTimes(1);
  });

  it("remembers which row failed", async () => {
    const decide = jest.fn().mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useQueueDecision(decide));

    await act(async () => {
      await result.current.run("row-3", false);
    });

    expect(result.current.failedId).toBe("row-3");
    expect(result.current.busyId).toBeNull();
  });

  it("clears the last failure when a new decision starts", async () => {
    const decide = jest
      .fn()
      .mockRejectedValueOnce(new Error("nope"))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() => useQueueDecision(decide));

    await act(async () => {
      await result.current.run("row-3", false);
    });
    await act(async () => {
      await result.current.run("row-3", false);
    });

    expect(result.current.failedId).toBeNull();
  });

  it("passes the decision through, both ways", async () => {
    const decide = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useQueueDecision(decide));

    await act(async () => {
      await result.current.run("row-1", true);
    });
    await act(async () => {
      await result.current.run("row-2", false);
    });

    expect(decide).toHaveBeenNthCalledWith(1, "row-1", true);
    expect(decide).toHaveBeenNthCalledWith(2, "row-2", false);
  });
});
