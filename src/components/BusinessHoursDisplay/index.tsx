import Modal from "@/components/Modal";
import { ScheduleIcon } from "@/components/icons";
import { BusinessHours } from "@/interfaces/businessHours";
import { useEffect, useMemo, type FC, useState } from "react";
import { capitalizedWord } from "@/utils";
import { getDate, getLocalHours, checkIfStoreOpen } from "@/utils/time";
import "./index.css";
import {
  BusinessHourDisplayInterface,
  BusinessHourFt,
} from "@/interfaces/businessHours";
import { WeekDay } from "@/types";

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

  const businessHoursFt: Record<WeekDay, BusinessHourFt> = {
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
      <div className="my-[10px] cursor-pointer">
        <div className="flex items-center text-[1em]">
          <ScheduleIcon size={20} />
          &nbsp;Business: Is&nbsp;
          <span
            className={
              isTodayOpen ? "font-bold text-brand" : "font-bold text-danger"
            }
          >
            {isTodayOpen ? `Open` : `Closed`} Now
          </span>
        </div>
        {isTodayOpen && (
          <div>{`${todaySchedule?.open_time} - ${todaySchedule?.close_time}`}</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const capitalizedHours = schedules.map((item) => {
      const day_of_week = item.day_of_week;
      let capitalized = "";
      if (day_of_week) {
        capitalized = capitalizedWord(day_of_week);
      }

      return {
        ...item,
        day_of_week: capitalized || item.day_of_week,
      };
    });
    if (capitalizedHours.length) {
      const dayWeek = getDate("", "dddd");
      const todaySch = capitalizedHours
        .filter((item) => item.day_of_week === dayWeek)
        .map((item) => {
          const { time1, time2 } = getLocalHours({
            time1: item?.open_time as string,
            time2: item?.close_time as string,
          });

          return {
            ...item,
            ...(time1 && { open_time: time1 }),
            ...(time2 && { close_time: time2 }),
          };
        });
      if (todaySch.length) {
        setTodaySchedule(todaySch[0]);
      }

      const isOpen = checkIfStoreOpen(todaySch[0]);
      setIsTodayOpen(isOpen);

      for (let schedule of capitalizedHours) {
        const key = schedule.day_of_week as WeekDay;
        if (key && key in businessHoursFt) {
          const { time1, time2 } = getLocalHours({
            time1: schedule?.open_time as string,
            time2: schedule?.close_time as string,
          });

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
        <div className="w-full">
          <div className="flex w-full justify-center">
            <h3>Business Hours</h3>
          </div>
          {formatSchedule.map((item) => {
            const hours =
              item.open_time && item.close_time
                ? `${item.open_time} - ${item.close_time}`
                : "CLOSED";
            return (
              <div key={item.day_of_week} className="flex w-full">
                <div className="flex w-1/2 justify-start">
                  {item.day_of_week}
                </div>
                <div className="flex w-1/2 justify-end">{hours}</div>
              </div>
            );
          })}
        </div>
      </Modal>
    )
  );
};

export default BusinessHourDisplay;
