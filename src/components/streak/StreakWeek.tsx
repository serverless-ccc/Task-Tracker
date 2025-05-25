import React from "react";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import fire from "../../assets/fire.lottie";

import useUserStore from "../../store/useUserStore";

interface StreakWeekProps {
  completedDates: string[];
  onDateClick?: (date: Date) => void;
  title?: string;
  includeTodayInStreak?: boolean;
  maxStreak?: number;
}

const StreakWeek = ({
  completedDates = [],
  onDateClick = () => {},
  includeTodayInStreak = false,
}: // maxStreak = 0,
StreakWeekProps) => {
  const today = new Date();

  const { profile } = useUserStore();

  // Get the start of the current week (Sunday)
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const weekStart = getWeekStart(today);

  // Generate array of 7 days starting from weekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  // Convert completed dates to a Set for faster lookup
  const completedDatesSet = new Set(
    completedDates.map((date: string | Date) => {
      if (typeof date === "string") return date;
      return date.toISOString().split("T")[0];
    })
  );

  // Check if a date is completed or part of current streak
  const isDateCompleted = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return completedDatesSet.has(dateStr) || isPartOfCurrentStreak(date);
  };

  // Check if date is part of current streak
  const isPartOfCurrentStreak = (date: Date) => {
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // If it's today, only include in streak if includeTodayInStreak is true
    if (isToday(date)) {
      return includeTodayInStreak;
    }

    // Calculate days difference
    const diffTime = todayDate.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Include if within current streak range
    const adjustedStreak = includeTodayInStreak
      ? profile?.streak ?? 0
      : (profile?.streak ?? 1) - 1;
    return diffDays > 0 && diffDays <= adjustedStreak;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  // Check if date is in the future
  const isFuture = (date: Date) => {
    return date > today;
  };

  // Handle date click
  const handleDateClick = (
    date: Date,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isFuture(date)) {
      onDateClick(date);
    }
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div
      className="text-white p-6 rounded-2xl"
      style={{
        backgroundColor: "rgba(204, 204, 204, 0.1)",
        backdropFilter: "blur(5px)",
        // boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-2 mb-4">
        <DotLottieReact
          src={fire}
          loop
          autoplay
          style={{ width: "100px", marginLeft: "-2rem" }}
        />
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-4xl font-bold text-white">
            {includeTodayInStreak
              ? profile?.streak ?? 0
              : (profile?.streak ?? 1) - 1}
          </span>
          <span className="text-sm text-white">day streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-white">
            {profile?.maxStreak}
          </span>
          <span className="text-sm text-white">Max streak</span>
        </div>
      </div>
      {/* <div>
          <h2 className="text-lg font-medium text-white">{title}</h2>
        </div> */}

      {/* Streak Counter */}

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {weekDays.map((date) => (
          <div
            key={date.toISOString()}
            className="text-center text-xs text-white font-medium pb-2"
          >
            {formatDayName(date)}
          </div>
        ))}

        {/* Week Days */}
        {weekDays.map((date) => {
          const isCurrentDay = isToday(date);
          const completed = isDateCompleted(date);
          const future = isFuture(date);
          const partOfStreak = isPartOfCurrentStreak(date);

          return (
            <button
              key={date.toISOString()}
              onClick={(e) => handleDateClick(date, e)}
              disabled={future}
              className={`
                h-8 w-8 rounded-full text-sm font-medium transition-all duration-200 mx-auto
                ${
                  isCurrentDay && !includeTodayInStreak
                    ? "!bg-blue-500 text-white hover:bg-blue-400"
                    : completed ||
                      partOfStreak ||
                      (isCurrentDay && includeTodayInStreak)
                    ? "bg-green-500 text-white hover:bg-green-400"
                    : future
                    ? "text-white cursor-not-allowed"
                    : "text-white hover:bg-gray-800"
                }
                ${
                  !future && !completed && !partOfStreak && !isCurrentDay
                    ? "hover:scale-105"
                    : ""
                }
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StreakWeek;
