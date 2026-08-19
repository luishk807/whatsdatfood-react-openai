export interface ApiUsageLineType {
  provider: string;
  operation: string;
  count: number;
  cost_usd: number;
}

export interface ApiUsageModelLineType {
  model: string;
  count: number;
  cost_usd: number;
}

export interface ApiUsageCallerType {
  user_id?: string | null;
  /** A hashed handle, never an address. */
  caller?: string | null;
  count: number;
  cost_usd: number;
}

export interface ApiUsagePeriodType {
  by_operation: ApiUsageLineType[];
  by_model: ApiUsageModelLineType[];
  total_cost_usd: number;
  searches: number;
  searches_served_locally: number;
  /** Null when nobody has searched: "no data" is not a zero per cent. */
  local_hit_rate?: number | null;
}

export interface ApiUsageReportType {
  today: ApiUsagePeriodType;
  this_month: ApiUsagePeriodType;
  heaviest_callers: ApiUsageCallerType[];
}
