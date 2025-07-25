import { Box, Grid } from "@mui/material";
import Modal from "@/components/Modal";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { BusinessHours } from "@/interfaces/businessHours";
import { useEffect, useMemo, type FC, useState } from "react";
import { getDate, convertTimeToLocal } from "@/utils";
import "./index.css";

export interface BusinessHourDisplayInterface {
  schedules: BusinessHours[];
}

interface BusinessHour {
  order: number;
  open_time?: string;
  close_time?: string;
  day_of_week?: string;
}

export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

const BusinessHourDisplay: FC<BusinessHourDisplayInterface> = ({
  schedules,
}) => {
  const [todaySchedule, setTodaySchedule] = useState<BusinessHours | null>(
    null,
  );
  const [formatSchedule, setFormatSchedule] = useState<BusinessHours[] | null>(
    null,
  );
  const [isTodayOpen, setIsTodayOpen] = useState(true);
  const todayDay = useMemo(() => {
    return getDate("", "dddd");
  }, [schedules]);

  const businessHoursFt: Record<WeekDay, BusinessHour> = {
    Monday: {
      order: 1,
    },
    Tuesday: {
      order: 2,
    },
    Wednesday: {
      order: 3,
    },
    Thursday: {
      order: 4,
    },
    Friday: {
      order: 5,
    },
    Saturday: {
      order: 6,
    },
    Sunday: {
      order: 7,
    },
  };

  const CustomButton = () => {
    return (
      <Box
        sx={{
          margin: "10px 0px",
        }}
      >
        <div className="flex item-center text-[1em]">
          <ScheduleIcon />
          &nbsp;Business: Is&nbsp;
          <Box
            component="span"
            style={{
              color: isTodayOpen ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {isTodayOpen ? `Open` : `Closed`} Today
          </Box>
        </div>
        <div>{`${todaySchedule?.open_time} - ${todaySchedule?.close_time}`}</div>
      </Box>
    );
  };

  useEffect(() => {
    if (schedules.length) {
      const dayWeek = getDate("", "dddd");
      const todaySch = schedules
        .filter((item) => item.day_of_week === dayWeek)
        .map((item) => {
          const time1 = convertTimeToLocal(item?.open_time as string);
          const time2 = convertTimeToLocal(item?.close_time as string);
          return {
            ...item,
            ...(time1 && { open_time: time1 }),
            ...(time2 && { close_time: time2 }),
          };
        });
      if (todaySch.length) {
        setTodaySchedule(todaySch[0]);
      }

      setIsTodayOpen(!!todaySch);

      for (let schedule of schedules) {
        const key = schedule.day_of_week as WeekDay;
        if (key && key in businessHoursFt) {
          const time1 = convertTimeToLocal(schedule?.open_time as string);
          const time2 = convertTimeToLocal(schedule?.close_time as string);
          const value = businessHoursFt[key];
          businessHoursFt[key] = {
            ...value,
            ...(time1 && { open_time: time1 }),
            ...(time2 && { close_time: time2 }),
            day_of_week: schedule.day_of_week,
          };
        }
      }

      const sortedHours = Object.keys(businessHoursFt)
        .sort(
          (a: string, b: string) =>
            businessHoursFt[a as WeekDay].order -
            businessHoursFt[b as WeekDay].order,
        )
        .map((key) => {
          return {
            ...businessHoursFt[key as WeekDay],
            day_of_week: key,
          };
        });
      setFormatSchedule(sortedHours);
    }
  }, [schedules, todayDay]);
  return (
    formatSchedule && (
      <Modal customButton={<CustomButton />}>
        <Box
          className="center-full bg-white-shawdow"
          sx={{
            padding: { lg: "10px", xs: "0px" },
            width: { lg: "400px", xs: "100%" },
          }}
        >
          <Grid className="w-full" container>
            <Grid className="w-full display flex justify-center">
              <h3>Business Hours</h3>
            </Grid>
            {formatSchedule.map((item) => {
              const hours =
                item.open_time && item.close_time
                  ? `${item.open_time} - ${item.close_time}`
                  : "CLOSED";
              return (
                <Grid className="w-full">
                  <Grid container>
                    <Grid size={6}>{item.day_of_week}</Grid>
                    <Grid size={6}>{hours}</Grid>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Modal>
    )
  );
};

export default BusinessHourDisplay;
