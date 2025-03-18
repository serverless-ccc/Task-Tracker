import React, { useState } from "react";
import { appendSpreadsheetData } from "../api/sheets";
import { format } from "date-fns";
import useQueryParams from "../hooks/useSearchParams";

interface Todo {
  id: number | string; // Unique identifier for the todo within the list
  name: string;
  date: string;
  Done: string;
  Ongoing: string;
  Cancelled: string;
  Postponed: string;
  NotStarted: string;
}

const DailyTaskTypeform: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [planType, setPlanType] = useState<string>(""); // "day" or "week"
  const [date, setDate] = useState<string>("");
  const [tasks, setTasks] = useState<{ text: string; status: string }[]>([
    { text: "", status: "Not Started" },
  ]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { getParams } = useQueryParams({});
  const { name, id } = getParams();

  // Task status options
  const statusOptions: string[] = [
    "Not Started",
    "Ongoing",
    "Done",
    "Cancelled",
    "Postponed",
  ];

  // Format today's date as YYYY-MM-DD for the date input default
  const today: Date = new Date();
  const formattedDate: string = today.toISOString().split("T")[0];

  const handlePlanTypeChange = (type: string): void => {
    setPlanType(type);
    nextStep();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDate(e.target.value);
  };

  const handleTaskChange = (
    index: number,
    field: string,
    value: string
  ): void => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const addTask = (): void => {
    setTasks([...tasks, { text: "", status: "Not Started" }]);
  };

  const removeTask = (index: number): void => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(
      newTasks.length ? newTasks : [{ text: "", status: "Not Started" }]
    );
  };

  const nextStep = (): void => {
    if (currentStep === 0 || (currentStep === 1 && date)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    event.preventDefault();

    const doneTasks = tasks.filter((task) => task.status === "Done");
    const ongoingTasks = tasks.filter((task) => task.status === "Ongoing");
    const cancelledTasks = tasks.filter((task) => task.status === "Cancelled");
    const postponedTasks = tasks.filter((task) => task.status === "Postponed");
    const notStartedTasks = tasks.filter(
      (task) => task.status === "Not Started"
    );

    if (!name || !id) return;
    const todoToAdd: Todo = {
      //   id: Date.now(),
      Done: doneTasks.map((task) => task.text).join(", "),
      Ongoing: ongoingTasks.map((task) => task.text).join(", "),
      Cancelled: cancelledTasks.map((task) => task.text).join(", "),
      Postponed: postponedTasks.map((task) => task.text).join(", "),
      NotStarted: notStartedTasks.map((task) => task.text).join(", "),
      name: name,
      id: id,
      date: format(new Date(date), "do MMM yyyy"),
    };

    appendSpreadsheetData([
      todoToAdd.id,
      todoToAdd.name,
      todoToAdd.date,
      todoToAdd.Done,
      todoToAdd.Ongoing,
      todoToAdd.Cancelled,
      todoToAdd.Postponed,
      todoToAdd.NotStarted,
    ]);
  };

  const resetForm = (): void => {
    setCurrentStep(0);
    setPlanType("");
    setDate(formattedDate);
    setTasks([{ text: "", status: "Not Started" }]);
    setIsSubmitted(false);
  };

  // Get status color based on status value
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Done":
        return "border-green-500";
      case "Ongoing":
        return "border-blue-500";
      case "Cancelled":
        return "border-red-500";
      case "Postponed":
        return "border-yellow-500";
      default:
        return "border-gray-300";
    }
  };

  // Render the form based on the current step
  const renderStep = (): JSX.Element | null => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-center">
              Are you planning for a day or a week?
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => handlePlanTypeChange("day")}
                className="px-6 py-3 text-lg font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Day
              </button>
              <button
                onClick={() => handlePlanTypeChange("week")}
                className="px-6 py-3 text-lg font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Week
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-center">
              {planType === "day"
                ? "What day are you planning for?"
                : "What week are you planning for?"}
            </h2>
            <input
              type="date"
              name="date"
              value={date || formattedDate}
              onChange={handleDateChange}
              className="p-3 md:p-4 text-base md:text-xl border rounded-lg shadow-sm w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex space-x-4">
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={nextStep}
                disabled={!date}
                className={`px-4 md:px-6 py-2 md:py-3 text-base md:text-lg font-medium rounded-lg transition-colors ${
                  date
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-center px-2">
              What tasks did you have planned for{" "}
              {planType === "day"
                ? new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : `the week of ${new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}`}
              ?
            </h2>

            <div className="w-full max-w-md space-y-4 px-2">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className={`flex flex-col space-y-2 p-3 md:p-4 border rounded-lg bg-white shadow-sm border-l-4 ${getStatusColor(
                    task.status
                  )}`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) =>
                        handleTaskChange(index, "text", e.target.value)
                      }
                      placeholder={`Task ${index + 1}`}
                      className="p-2 md:p-3 flex-grow border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                    />
                    <button
                      onClick={() => removeTask(index)}
                      className="p-2 md:p-3 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs md:text-sm text-gray-600 font-medium">
                      Status:
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleTaskChange(index, "status", e.target.value)
                      }
                      className="p-1 md:p-2 border rounded-lg text-xs md:text-sm flex-grow focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 md:space-x-4">
              <button
                onClick={addTask}
                className="px-3 md:px-4 py-2 text-sm md:text-base text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                + Add Task
              </button>

              <button
                onClick={handleSubmit}
                disabled={tasks.every((task) => task.text.trim() === "")}
                className={`px-4 md:px-6 py-2 text-sm md:text-base text-white rounded-lg transition-colors ${
                  tasks.some((task) => task.text.trim() !== "")
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </div>

            <button
              onClick={prevStep}
              className="px-4 py-2 text-sm md:text-base text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  // Render the summary after submission
  const renderSummary = (): JSX.Element => {
    return (
      <div className="flex flex-col items-center space-y-6 w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center">
          {planType === "day" ? "Your Daily Plan" : "Your Weekly Plan"}
        </h2>

        <div className="w-full max-w-md p-4 md:p-6 bg-white border rounded-lg shadow-md">
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            {planType === "day"
              ? new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : `Week of ${new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`}
          </h3>

          {tasks.length > 0 ? (
            <ul className="space-y-3">
              {tasks.map((task, index) => (
                <li
                  key={index}
                  className={`flex items-center p-2 md:p-3 border-l-4 ${getStatusColor(
                    task.status
                  )} rounded-lg shadow-sm`}
                >
                  <span className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full mr-2 md:mr-3 text-xs md:text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-grow text-sm md:text-base">
                    {task.text}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic text-sm md:text-base">
              No tasks added for this {planType}.
            </p>
          )}
        </div>
        <button
          onClick={resetForm}
          className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          Create Another Plan
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="w-full max-w-xl md:max-w-2xl bg-white rounded-xl shadow-lg p-4 md:p-8">
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
            Daily Task Planner
          </h1>
          <p className="text-center text-gray-600 mt-2 text-sm md:text-base">
            Plan your day efficiently
          </p>
        </div>

        {!isSubmitted ? (
          <div className="w-full">{renderStep()}</div>
        ) : (
          renderSummary()
        )}
      </div>
    </div>
  );
};

export default DailyTaskTypeform;
