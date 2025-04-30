import { Form, message } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import useQueryParams from "../../hooks/useSearchParams";
import dayjs, { Dayjs } from "dayjs";

export interface Todo {
  id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  employeeId: string;
  date: string;
  isForAWeek: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface FormValues {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  employeeId?: string;
  date?: Dayjs;
}

interface Todos {
  pending: Todo[];
  inProgress: Todo[];
  completed: Todo[];
  cancelled: Todo[];
  postponed: Todo[];
  notStarted: Todo[];
}
export const useTask = () => {
  const [form] = Form.useForm<FormValues>();
  const [editingTaskForm] = Form.useForm<FormValues>();

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

  const handleNextStep = () => {
    if (!date) {
      message.error("Please select a date before proceeding");
      return;
    }
    setStep(1);
  };

  const handleSubmit = async (values: Todo) => {
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
      const response = await axios.delete(
        `https://api.glenwebdev.space/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
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
      //   "https://api.openai.com/v1/chat/completions",
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
    editingTaskForm.setFieldsValue({
      status: todo.status,
      priority: todo.priority,
    });
  };

  const updateTodo = () => {
    const updatedTodo = {
      date: date,
      isForAWeek: isForAWeek,
      title: form.getFieldValue("title"),
      description: form.getFieldValue("description"),
      status: editingTaskForm.getFieldValue("status"),
      priority: editingTaskForm.getFieldValue("priority"),
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

  return {
    form,
    todos,
    isForAWeek,
    step,
    setStep,
    date,
    loadingAI,
    editingTodo,
    setDate,
    setIsForAWeek,
    handleNextStep,
    handleSubmit,
    handleDelete,
    handleElaborate,
    handleEdit,
    loading,
    updateTodo,
    editingTaskForm,
  };
};
