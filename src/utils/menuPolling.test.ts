import { MENU_WAIT } from "@/customConstants";
import { pollInterval } from "@/utils/menuPolling";

/**
 * How often the page asks whether the menu has arrived.
 *
 * Polling cannot start a generation — `menuStatus` is one indexed read and
 * the only thing allowed to queue one is somebody opening the restaurant — so
 * none of this can spend money on a model. It can still spend server, which
 * is what the ladder is for: a page left open in a tab must not ask twenty
 * times a minute for an hour.
 */
describe("how often to ask whether the menu is ready", () => {
  it("asks quickly while the answer is most likely to change", () => {
    // Most menus land in the first half-minute, and a reader watching the
    // panel should see it change almost as soon as it does.
    expect(pollInterval(0)).toBe(3000);
    expect(pollInterval(5000)).toBe(3000);
  });

  it("slows down once the quick answer did not come", () => {
    expect(pollInterval(45000)).toBeGreaterThan(pollInterval(5000));
    expect(pollInterval(200000)).toBeGreaterThan(pollInterval(45000));
  });

  it("never asks more than once every three seconds", () => {
    // A second-by-second poll is a self-inflicted load test, and the answer
    // is never that fresh.
    for (const elapsed of [0, 1, 999, 30000, 120000, 3600000]) {
      expect(pollInterval(elapsed)).toBeGreaterThanOrEqual(3000);
    }
  });

  it("stops getting slower rather than growing without limit", () => {
    // An interval that keeps doubling means a menu that landed an hour into
    // a forgotten tab is never noticed at all.
    const slowest = Math.max(...MENU_WAIT.POLL_STEPS.map((one) => one.every));

    expect(pollInterval(86400000)).toBe(slowest);
  });

  it("only ever moves in one direction", () => {
    // A ladder that dipped would mean the page asking *more* often the
    // longer it waits, which is the opposite of the intent.
    const points = [0, 10000, 30000, 60000, 120000, 300000];
    const intervals = points.map(pollInterval);

    expect([...intervals].sort((a, b) => a - b)).toEqual(intervals);
  });
});
