import React, { useState } from "react";
import { appendSpreadsheetData } from "../api/sheets";
import { format } from "date-fns";
import useQueryParams from "../hooks/useSearchParams";

import { DatePicker, Input, message, Select, Form } from "antd";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

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
  const [form, setForm] = useState<{ name: string; id: string }>({
    name: "",
    id: "",
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { getParams, updateParams } = useQueryParams({});
  const { name, id } = getParams();

  // Task status options
  const statusOptions = [
    { value: "Not Started", label: "Not Started" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Done", label: "Done" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Postponed", label: "Postponed" },
  ];
  const navigate = useNavigate();
  // Format today's date as YYYY-MM-DD for the date input default
  const today: Date = new Date();
  const formattedDate: string = today.toISOString().split("T")[0];

  const handlePlanTypeChange = (type: string): void => {
    setPlanType(type);
    nextStep();
  };

  const handleDateChange = (e: Date): void => {
    setDate(format(e, "do MMM yyyy"));
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
    message.open({
      key: "submit",
      type: "loading",
      content: "Submitting...",
      duration: 2,
    });

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
      date: date,
    };

    try {
      await appendSpreadsheetData([
        todoToAdd.id,
        todoToAdd.name,
        todoToAdd.date,
        todoToAdd.Done,
        todoToAdd.Ongoing,
        todoToAdd.Cancelled,
        todoToAdd.Postponed,
        todoToAdd.NotStarted,
      ]);
      message.open({
        key: "submit",
        type: "success",
        content: "Plan submitted successfully",
      });
      navigate("/submited");
    } catch (error) {
      message.open({
        key: "submit",
        type: "error",
        content: "Error submitting plan",
      });
    }
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
          <div className="flex flex-col space-y-6 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-left">
              Are you updating for a day or a week?
            </h2>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                size="large"
                type="primary"
                onClick={() => handlePlanTypeChange("day")}
              >
                Day
              </Button>
              <Button
                size="large"
                type="primary"
                onClick={() => handlePlanTypeChange("week")}
              >
                Week
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col  space-y-6 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-left">
              {planType === "day"
                ? "What did you plan for today?"
                : "What did you plan for this week?"}
            </h2>
            {planType === "day" ? (
              <DatePicker
                onChange={handleDateChange}
                size="large"
                className="max-w-[250px]"
                status={date === "" ? "error" : undefined}
              />
            ) : (
              <DatePicker
                onChange={handleDateChange}
                picker="week"
                showWeek
                size="large"
                className="max-w-[250px]"
              />
            )}
            {/* <input
              type="date"
              name="date"
              value={date || formattedDate}
             
              className="p-3 md:p-4 text-base md:text-xl border rounded-lg shadow-sm w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            /> */}
            <div className="flex space-x-4">
              <Button onClick={prevStep} size="large" type="default">
                ← Back
              </Button>
              <Button size="large" type="primary" onClick={nextStep}>
                Continue →
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col space-y-6 w-full">
            <h2 className="text-xl md:text-2xl font-bold text-left">
              What tasks did you have planned for {date}?
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
                    <Button
                      onClick={() => removeTask(index)}
                      className="p-2 md:p-3 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs md:text-sm text-gray-600 font-medium">
                      Status:
                    </label>
                    <Select
                      value={task.status}
                      size="large"
                      onChange={(e) => handleTaskChange(index, "status", e)}
                      className="w-full"
                      options={statusOptions}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-start gap-3 md:space-x-4">
              <Button size="large" onClick={addTask}>
                + Add Task
              </Button>

              <Button
                size="large"
                onClick={handleSubmit}
                type="primary"
                disabled={tasks.every((task) => task.text.trim() === "")}
              >
                Submit
              </Button>
            </div>

            <Button onClick={prevStep} size="large">
              ← Back
            </Button>
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
        <h2 className="text-xl md:text-2xl font-bold text-left">
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
        <Button
          onClick={resetForm}
          className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          Create Another Plan
        </Button>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="flex flex-co p-2 md:p-4">
        <div className="w-full max-w-xl md:max-w-2xl p-4 md:p-8">
          <div className="mb-4 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-left text-gray-800">
              Daily Task Updater
            </h1>
            <h1 className="text-left text-gray-600 text-xl md:text-2xl mt-2 capitalize">
              {`Good ${
                new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 18
                  ? "afternoon"
                  : "evening"
              }, ${name ? name : "Stranger"}`}
            </h1>
            <p className="text-left text-gray-600 mt-2 text-sm md:text-base">
              {name ? (
                "Update your daily tasks"
              ) : (
                <div className="flex flex-col">
                  <span> Please Fill the form below</span>

                  <span className="flex flex-col">
                    <Form
                      name="layout-multiple-horizontal"
                      layout="vertical"
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      // className="flex flex-col"
                      onFinish={() => {
                        updateParams({
                          name: form.name,
                          id: form.id,
                        });
                      }}
                    >
                      <Form.Item
                        label="Name"
                        name="Name"
                        layout="vertical"
                        rules={[{ required: true }]}
                      >
                        <Select
                          placeholder="Select your name"
                          options={[
                            { value: "Glen", label: "Glen", id: "900107" },
                            { value: "Amlan", label: "Amlan" },
                            { value: "Daarshik", label: "Daarshik" },
                            { value: "Pooja", label: "Pooja" },
                            { value: "Deepak", label: "Deepak" },
                            { value: "Ram Manohar", label: "Ram Manohar" },
                          ]}
                          className="xl:max-w-[250px]"
                          onSelect={(value) => {
                            setForm((prev) => ({ ...prev, name: value }));
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        label="ID"
                        name="ID"
                        layout="vertical"
                        rules={[{ required: true }]}
                      >
                        <Input
                          placeholder="Enter your id"
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              id: e.target.value,
                            }));
                          }}
                          className="xl:max-w-[250px]"
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="xl:max-w-[250px]"
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </Form>
                  </span>
                </div>
              )}
            </p>
          </div>

          {name && id && (
            <span>
              {!isSubmitted ? (
                <div className="w-full">{renderStep()}</div>
              ) : (
                renderSummary()
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyTaskTypeform;
