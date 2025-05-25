import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

interface StreakCalendarProps {
  completedDates: string[];
  currentStreak: number;
  onDateClick?: (date: Date) => void;
  title?: string;
  includeTodayInStreak?: boolean;
}

const StreakCalendar = ({
  completedDates = [],
  currentStreak = 0,
  onDateClick = () => {},
  title = "Streak",
  includeTodayInStreak = true,
}: StreakCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Convert completed dates to a Set for faster lookup
  const completedDatesSet = new Set(
    completedDates.map((date: string | Date) => {
      if (typeof date === "string") return date;
      return date.toISOString().split("T")[0];
    })
  );

  // Check if a date is completed or part of current streak
  const isDateCompleted = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return completedDatesSet.has(dateStr) || isPartOfCurrentStreak(day);
  };

  // Check if date is part of current streak (last N days from today)
  const isPartOfCurrentStreak = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // If it's today, only include in streak if includeTodayInStreak is true
    if (isToday(day)) {
      return includeTodayInStreak;
    }

    // Calculate days difference
    const diffTime = todayDate.getTime() - dateToCheck.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Include if within current streak range (0 to currentStreak-1 days ago)
    // If includeTodayInStreak is false, we need to adjust the range
    const adjustedStreak = includeTodayInStreak
      ? currentStreak
      : currentStreak - 1;
    return diffDays > 0 && diffDays <= adjustedStreak;
  };

  // Check if date is today
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  // Check if date is in the future
  const isFuture = (day: number) => {
    const dateToCheck = new Date(year, month, day);
    return dateToCheck > today;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Handle date click
  const handleDateClick = (
    day: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (day && !isFuture(day)) {
      const clickedDate = new Date(year, month, day);
      onDateClick(clickedDate);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div
      className="text-white p-6 rounded-2xl max-w-sm mx-auto"
      style={{
        backgroundColor: "rgba(204, 204, 204, 0.1)",
        backdropFilter: "blur(5px)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
          <span className="text-sm text-white min-w-[80px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-800 rounded"
          >
            <ChevronRight size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Streak Counter */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="text-orange-500" size={20} />
        <span className="text-4xl font-bold text-white">
          {includeTodayInStreak ? currentStreak : currentStreak - 1}
        </span>
        <span className="text-sm text-white">day streak</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {["S", "M", "T", "W", "T", "F", "S"].map((dayName, index) => (
          <div
            key={index}
            className="text-center text-xs text-white font-medium pb-2"
          >
            {dayName}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={index} className="h-8"></div>;
          }

          const isCurrentDay = isToday(day);
          const completed = isDateCompleted(day);
          const future = isFuture(day);
          const partOfStreak = isPartOfCurrentStreak(day);

          return (
            <button
              key={day}
              onClick={(e) => handleDateClick(day, e)}
              disabled={future}
              className={`
                h-8 w-8 rounded-full text-sm font-medium transition-all duration-200
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
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default StreakCalendar;
