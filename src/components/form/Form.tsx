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
  Card,
  Popconfirm,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, RobotOutlined } from "@ant-design/icons";
import axios from "axios";
import type { Dayjs } from "dayjs";
import useQueryParams from "../../hooks/useSearchParams";

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
  const [editingTask] = Form.useForm<FormValues>();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [isForAWeek, setIsForAWeek] = useState<boolean>(false);
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);

  const { getParams } = useQueryParams();

  const { name, id } = getParams();

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getTodos = async (authToken: string) => {
    const response = await axios.get("https://api.glenwebdev.space/tasks", {
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

      setTodos([
        ...pendingTodos,
        ...inProgressTodos,
        ...completedTodos,
        ...cancelledTodos,
      ]);
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
            "https://api.glenwebdev.space/users/login",
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
    setTodos([...todos, newTodo]);
    try {
      setLoading(true);
      const response = await axios.post(
        "https://api.glenwebdev.space/tasks",
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

  const handleDelete = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    axios.delete(`https://api.glenwebdev.space/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  };

  const handleElaborate = async () => {
    try {
      setLoadingAI(true);
      const title = form.getFieldValue("title") || "a general task";
      const description = form.getFieldValue("description") || "";

      const prompt = `Please elaborate on this task with professional, detailed language suitable for a senior manager's review.Important: make it sound humanlike as much as possible. Make the response like a small brief not exceeding 100 words. Focus only on enhancing the task description with relevant details. Title: "${title}". Initial Notes: "${description}".`;

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
        `http://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
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

  const handleEdit = (todo: Todo) => {
    setDate(dayjs(todo.date));
    setIsForAWeek(todo.isForAWeek);
    setEditingTodo(todo.id || null);

    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      status: todo.status,
      priority: todo.priority,
      id: todo.id,
    });
  };

  const updateTodo = () => {
    const updatedTodo = {
      date: date,
      isForAWeek: isForAWeek,
      title: form.getFieldValue("title"),
      description: form.getFieldValue("description"),
      status: editingTask.getFieldValue("status"),
      priority: editingTask.getFieldValue("priority"),
      id: form.getFieldValue("id"),
      employeeId: id as string,
    };
    try {
      axios.put(
        `https://api.glenwebdev.space/tasks/${updatedTodo.id}`,
        updatedTodo,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      getTodos(authToken as string);
      message.success("Todo updated successfully!");
      setEditingTodo(null);
    } catch (err) {
      console.error(err);
      message.error("Failed to update todo");
    }
  };
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
            label: "📝 Create Todo",
            children: (
              <>
                <Steps
                  current={step}
                  direction="vertical"
                  size="small"
                  className="mb-6"
                >
                  <Step title="Set Duration & Date" />
                  <Step title="Enter Todo Details" />
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
                    disabled={editingTodo !== null}
                  >
                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[
                        { required: true, message: "Please enter a title" },
                      ]}
                    >
                      <Input placeholder="Enter todo title" />
                    </Form.Item>

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
                    <Button
                      onClick={handleElaborate}
                      loading={loadingAI}
                      icon={<RobotOutlined />}
                      className="mb-4"
                    >
                      Elaborate with AI
                    </Button>

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
                          {editingTodo === null ? "Add Todo" : "Update Todo"}
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
            Good {getTimeOfDay()} <span className="capitalize">{name}</span>
          </h1>

          <h2 className="text-xl font-bold m-0">🗂️ Your tasks</h2>

          {todos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              {todos.map((todo: Todo) => (
                <Card
                  key={todo.title}
                  title={todo.title}
                  className="shadow-sm"
                  extra={
                    <div className="flex gap-2">
                      {editingTodo === todo.id ? (
                        <Button
                          type="primary"
                          size="small"
                          shape="round"
                          onClick={updateTodo}
                        >
                          Update
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          shape="round"
                          onClick={() => handleEdit(todo)}
                        >
                          Edit
                        </Button>
                      )}
                      <Popconfirm
                        title="Are you sure you want to delete this todo?"
                        onConfirm={() => handleDelete(todo.id as string)}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          shape="round"
                        >
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  }
                >
                  <Collapse
                    items={[
                      {
                        key: "1",
                        label: (
                          <span className="text-sm text-gray-600 mb-2">
                            {todo.description.length > 10
                              ? todo.description.slice(0, 30) + "..."
                              : todo.description}
                          </span>
                        ),
                        children: (
                          <p className="text-sm text-gray-600 mb-2">
                            {todo.description}
                          </p>
                        ),
                      },
                    ]}
                  />

                  <Form layout="vertical" form={editingTask}>
                    <div className="flex flex-wrap text-xs gap-2 mb-2 mt-4">
                      <Form.Item
                        name="status"
                        label="Status"
                        rules={[
                          { required: true, message: "Please select a status" },
                        ]}
                        initialValue={todo.status}
                      >
                        <Select
                          placeholder="Select status"
                          options={statusOptions}
                          disabled={editingTodo !== todo.id}
                        />
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
                        initialValue={todo.priority}
                      >
                        <Select
                          placeholder="Select priority"
                          options={priorityOptions}
                          disabled={editingTodo !== todo.id}
                        />
                      </Form.Item>
                    </div>
                  </Form>

                  <p className="text-xs text-gray-500">
                    <strong>Employee ID:</strong> {todo.employeeId}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Date:</strong>{" "}
                    {new Date(todo.date).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>Duration:</strong>{" "}
                    {todo.isForAWeek ? "For a week" : "For a day"}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No todos yet. Add one from the form.
            </p>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default TodoForm;
