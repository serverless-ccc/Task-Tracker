import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Switch,
  message,
  Collapse,
  Steps,
  Layout,
  Spin,
} from "antd";

import { PlusOutlined, RobotOutlined } from "@ant-design/icons";
import axios from "axios";
import type { Dayjs } from "dayjs";
import useQueryParams from "../../hooks/useSearchParams";
import TrelloCard, { CardData } from "../Card";
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;
const { Content } = Layout;

interface Todo {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  employeeId: string;
  date: string;
  isForAWeek: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

interface FormValues {
  id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  employeeId: string;
  date: Dayjs;
}

interface Todos {
  pending: Todo[];
  inProgress: Todo[];
  completed: Todo[];
  cancelled: Todo[];
  postponed: Todo[];
  notStarted: Todo[];
}
const getTimeOfDay = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) {
    return "Morning";
  } else if (hours >= 12 && hours < 17) {
    return "Afternoon";
  } else {
    return "Evening";
  }
};

const TodoForm: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  // const [editingTask] = Form.useForm<FormValues>();

  const [todos, setTodos] = useState<Todos>({
    pending: [],
    inProgress: [],
    completed: [],
    cancelled: [],
    postponed: [],
    notStarted: [],
  });
  const [isForAWeek, setIsForAWeek] = useState<boolean>(false);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  // const [editingTodo, setEditingTodo] = useState<string | null>(null);

  const { getParams } = useQueryParams();

  const { name, id } = getParams();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getTodos = async (authToken: string) => {
    const response = await axios.get("http://localhost:3000/tasks", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 200 || response.status === 201) {
      const pendingTodos = response.data.filter(
        (todo: Todo) => todo.status === "PENDING"
      );
      const inProgressTodos = response.data.filter(
        (todo: Todo) => todo.status === "IN_PROGRESS"
      );
      const completedTodos = response.data.filter(
        (todo: Todo) => todo.status === "COMPLETED"
      );
      const cancelledTodos = response.data.filter(
        (todo: Todo) => todo.status === "CANCELLED"
      );
      const postponedTodos = response.data.filter(
        (todo: Todo) => todo.status === "POSTPONED"
      );
      const notStartedTodos = response.data.filter(
        (todo: Todo) => todo.status === "NOT_STARTED"
      );
      setTodos({
        pending: pendingTodos,
        inProgress: inProgressTodos,
        completed: completedTodos,
        cancelled: cancelledTodos,
        postponed: postponedTodos,
        notStarted: notStartedTodos,
      });
    } else {
      message.error("Failed to fetch todos");
    }
  };

  useEffect(() => {
    const loginUser = async () => {
      if (name && id) {
        try {
          setLoading(true);
          const response = await axios.post(
            "http://localhost:3000/users/login",
            {
              email: name,
              password: id,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200 || response.status === 201) {
            const data = response.data;
            setAuthToken(data.token);
            localStorage.setItem("authToken", data.token);
            getTodos(data.token);
          } else {
            console.error("Login failed");
          }
        } catch (error) {
          console.error("Error during login:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loginUser();
  }, [name, id]);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "IN_PROGRESS", label: "In progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "POSTPONED", label: "Postponed" },
    { value: "NOT_STARTED", label: "Not started" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const handleNextStep = () => {
    if (!date) {
      message.error("Please select a date before proceeding");
      return;
    }
    setStep(1);
  };

  const handleSubmit = async (values: Omit<FormValues, "date">) => {
    if (!date) return;

    const newTodo: Todo = {
      ...values,
      date: date.toISOString(),
      isForAWeek,
      employeeId: id as string,
      id: form.getFieldValue("id") || undefined,
    };
    // setTodos({
    //   ...todos,
    //   [newTodo.status as keyof Todos]: [
    //     ...todos[newTodo.status as keyof Todos],
    //     newTodo,
    //   ],
    // });
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/tasks",
        { todos: [newTodo] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      getTodos(authToken as string);
      if (response.status === 200 || response.status === 201) {
        message.success("Todo added successfully!");
      } else {
        message.error("Failed to add todo");
      }
    } catch (error) {
      console.error("Error submitting todos:", error);
      message.error("An error occurred while submitting todos");
    } finally {
      setLoading(false);
    }

    form.resetFields();
  };

  const handleDelete = async (id: string) => {
    // const todo = Object.values(todos)
    //   .flat()
    //   .find((todo: Todo) => todo.id === id);
    // if (!todo) return;
    // setTodos({
    //   ...todos,
    //   [todo.status as keyof Todos]: todos[todo.status as keyof Todos].filter(
    //     (todo: Todo) => todo.id !== id
    //   ),
    // });
    try {
      const response = await axios.delete(`http://localhost:3000/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      getTodos(authToken as string);
      if (response.status === 200 || response.status === 201) {
        message.success("Todo deleted successfully!");
      } else {
        message.error("Failed to delete todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      message.error("Failed to delete todo");
    }
  };

  const handleElaborate = async () => {
    try {
      setLoadingAI(true);
      const title = form.getFieldValue("title") || "a general task";

      const prompt = `Please elaborate on this task with professional, detailed language suitable for a senior manager's review.Important: make it sound humanlike as much as possible. Please elaborate on the following completed tasks in a way that would be suitable for a project update or submission. For each task, provide a more detailed explanation not exceeding 100 words of what was accomplished, the impact of the work, and any relevant context or details. The goal is to create a clear and informative summary of the progress made. give me the text directly dont add anything about the prompt, only give the **Elaboration:**, dont make it more than a 100 wrods, Initial Notes: "${title}".`;

      // OpenAI API call (commented out)
      // const res = await axios.post(
      //   "http://api.openai.com/v1/chat/completions",
      //   {
      //     model: "gpt-3.5-turbo",
      //     messages: [{ role: "user", content: prompt }],
      //     temperature: 0.7,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer`,
      //     },
      //   }
      // );

      // Gemini API call
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_GEMINI_API_KEY
        }`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const detailedText = res.data.candidates[0].content.parts[0].text;
      form.setFieldsValue({ description: detailedText });
      message.success("Task elaborated with AI!");
    } catch (err) {
      console.error(err);
      message.error("Failed to generate description");
    } finally {
      setLoadingAI(false);
    }
  };

  // const handleEdit = (todo: Todo) => {
  //   setDate(dayjs(todo.date));
  //   setIsForAWeek(todo.isForAWeek);
  //   setEditingTodo(todo.id || null);

  //   form.setFieldsValue({
  //     title: todo.title,
  //     description: todo.description,
  //     status: todo.status,
  //     priority: todo.priority,
  //     id: todo.id,
  //   });
  // };

  // const updateTodo = () => {
  //   const updatedTodo = {
  //     date: date,
  //     isForAWeek: isForAWeek,
  //     title: form.getFieldValue("title"),
  //     description: form.getFieldValue("description"),
  //     status: editingTask.getFieldValue("status"),
  //     priority: editingTask.getFieldValue("priority"),
  //     id: form.getFieldValue("id"),
  //     employeeId: id as string,
  //   };
  //   try {
  //     axios.put(`http://localhost:3000/tasks/${updatedTodo.id}`, updatedTodo, {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     });
  //     getTodos(authToken as string);
  //     message.success("Todo updated successfully!");
  //     setEditingTodo(null);
  //   } catch (err) {
  //     console.error(err);
  //     message.error("Failed to update todo");
  //   }
  // };
  if (loading) {
    return <Spin />;
  }
  return (
    <Layout className="min-h-screen bg-gray-100 p-4 flex flex-col md:flex-row gap-4">
      <Collapse
        className="w-full md:min-w-[450px] md:max-w-[450px] bg-white rounded-md shadow-sm"
        defaultActiveKey={["1"]}
        items={[
          {
            key: "1",
            label: "📝 Create Your Tasks",
            children: (
              <>
                <Steps
                  current={step}
                  direction="vertical"
                  size="small"
                  className="mb-6"
                >
                  <Step title="Set Duration & Date" />
                  <Step title="Enter Tasks" />
                </Steps>

                {step === 0 && (
                  <>
                    <div className="mb-4">
                      <span className="mr-2 font-medium">For a day</span>
                      <Switch checked={isForAWeek} onChange={setIsForAWeek} />
                      <span className="ml-2 font-medium">For a week</span>
                    </div>

                    <DatePicker
                      value={date}
                      onChange={setDate}
                      className="w-full mb-4"
                      format="YYYY-MM-DD"
                    />

                    <Button type="primary" block onClick={handleNextStep}>
                      Next
                    </Button>
                  </>
                )}

                {step === 1 && (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                      status: "PENDING",
                      priority: "MEDIUM",
                    }}
                    // disabled={editingTodo !== null}
                  >
                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[
                        { required: true, message: "Please enter a title" },
                      ]}
                    >
                      <TextArea rows={6} placeholder="Enter Your Task" />
                    </Form.Item>
                    <Button
                      onClick={handleElaborate}
                      loading={loadingAI}
                      icon={<RobotOutlined />}
                      className="mb-4"
                    >
                      Elaborate with AI
                    </Button>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[
                        {
                          required: true,
                          message: "Please enter a description",
                        },
                      ]}
                    >
                      <TextArea
                        rows={6}
                        placeholder="Enter detailed description"
                      />
                    </Form.Item>

                    <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
                      <Form.Item
                        name="status"
                        label="Status"
                        rules={[
                          { required: true, message: "Please select a status" },
                        ]}
                      >
                        <Select placeholder="Select status">
                          {statusOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[
                          {
                            required: true,
                            message: "Please select a priority",
                          },
                        ]}
                      >
                        <Select placeholder="Select priority">
                          {priorityOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
                      <Button block onClick={() => setStep(0)} className="mb-4">
                        ← Back
                      </Button>

                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<PlusOutlined />}
                          block
                        >
                          Add Task
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                )}
              </>
            ),
          },
        ]}
      />

      <Content>
        <div className="flex-1 bg-white p-4 rounded-md shadow-sm">
          <h1 className="text-2xl font-bold m-0">
            Good {getTimeOfDay()}{" "}
            <span className="capitalize">{name} (🗂️ Your tasks)</span>
          </h1>

          <div className="grid xl:grid-cols-3 grid-cols-1 gap-4 mt-4">
            <div className="bg-gray-200 px-4 py-4 rounded-lg">
              <h2 className="text-lg font-normal">Ongoing Tasks</h2>
              <div className="flex flex-col gap-4 mt-4">
                {todos.inProgress.map((todo) => (
                  <TrelloCard
                    key={todo.id}
                    cardData={todo as CardData}
                    handleDelete={() => handleDelete(todo.id as string)}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-200 px-4 py-4 rounded-lg">
              <h2 className="text-lg font-normal">Pending Tasks</h2>
              <div className="flex flex-col gap-4 mt-4">
                {todos.pending.map((todo) => (
                  <TrelloCard
                    key={todo.id}
                    cardData={todo as CardData}
                    handleDelete={() => handleDelete(todo.id as string)}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gray-200 px-4 py-4 rounded-lg">
              <h2 className="text-lg font-normal">Completed Tasks</h2>
              <div className="flex flex-col gap-4 mt-4">
                {todos.completed.map((todo) => (
                  <TrelloCard
                    key={todo.id}
                    cardData={todo as CardData}
                    handleDelete={() => handleDelete(todo.id as string)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default TodoForm;
