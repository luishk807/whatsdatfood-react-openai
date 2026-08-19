import { render, screen } from "@testing-library/react";
import ApiUsagePanel from "@/components/ApiUsagePanel";
import { USAGE_LABELS } from "@/customConstants/labels";

const state = {
  data: null as unknown,
  loading: false,
  error: null as unknown,
};

jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: () => state,
}));

const period = (over = {}) => ({
  by_operation: [],
  by_model: [],
  total_cost_usd: 0,
  searches: 0,
  searches_served_locally: 0,
  local_hit_rate: null,
  ...over,
});

const report = (over = {}) => ({
  data: {
    apiUsage: {
      today: period(),
      this_month: period(),
      heaviest_callers: [],
      ...over,
    },
  },
});

describe("ApiUsagePanel", () => {
  beforeEach(() => {
    state.data = null;
    state.loading = false;
    state.error = null;
  });

  it("leads with the hit rate, not the spend", () => {
    // The bill is a symptom. The proportion of searches answered from our own
    // rows is what decides it.
    state.data = report({
      this_month: period({
        searches: 1000,
        searches_served_locally: 870,
        local_hit_rate: 0.87,
        total_cost_usd: 4.21,
      }),
    }).data;
    render(<ApiUsagePanel />);

    expect(screen.getByText(USAGE_LABELS.hitRate)).toBeInTheDocument();
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("does not call a quiet day a zero per cent hit rate", () => {
    // "No data" and "we paid for every single one" are different things, and
    // only one of them is bad news.
    state.data = report().data;
    render(<ApiUsagePanel />);

    expect(screen.getByText(USAGE_LABELS.noSearchesYet)).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("shows what was spent, by operation and by model", () => {
    state.data = report({
      today: period({
        total_cost_usd: 1.5,
        by_operation: [
          {
            provider: "google",
            operation: "autocomplete",
            count: 120,
            cost_usd: 0.34,
          },
        ],
        by_model: [{ model: "gpt-4o-mini", count: 8, cost_usd: 0.01 }],
      }),
    }).data;
    render(<ApiUsagePanel />);

    expect(screen.getByText(/Google autocomplete/)).toBeInTheDocument();
    expect(screen.getByText("gpt-4o-mini")).toBeInTheDocument();
  });

  it("names heavy callers by hash, never by address", () => {
    state.data = report({
      heaviest_callers: [
        { user_id: null, caller: "a1b2c3d4e5f6", count: 400, cost_usd: 1.13 },
      ],
    }).data;
    render(<ApiUsagePanel />);

    expect(screen.getByText("a1b2c3d4e5f6")).toBeInTheDocument();
    expect(screen.getByText(USAGE_LABELS.heaviestNote)).toBeInTheDocument();
  });

  it("says the report is unavailable rather than reporting zero spend", () => {
    // The API deploys separately and routinely lags. "We could not ask" is a
    // different claim from "nothing was spent".
    state.error = new Error("nope");
    render(<ApiUsagePanel />);

    expect(screen.getByText(USAGE_LABELS.unavailable)).toBeInTheDocument();
  });
});
