export interface BusinessHours {
  id?: bigint;
  day_of_week?: string;
  open_time?: string;
  close_time?: string;
  status_id?: boolean;
}

export interface BusinessHourDisplayInterface {
  schedules: BusinessHours[];
}
export interface BusinessHourFt {
  order: number;
  open_time?: string;
  close_time?: string;
  day_of_week?: string;
}
