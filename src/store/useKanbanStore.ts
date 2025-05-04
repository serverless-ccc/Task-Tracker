// src/store/useKanbanStore.ts
import { create } from "zustand";
import { message } from "antd";
import dayjs from "dayjs";
import apiClient from "../api/_setup";
import { AxiosResponse } from "axios";
import { UserProfile } from "../context/useUserContext";
export interface Task {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  employeeId?: string;
  date?: string;
  isForAWeek?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  column?: string;
  user?: UserProfile;
}

export interface FormValues {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  employeeId?: string;
  date?: dayjs.Dayjs;
}

interface KanbanState {
  // State
  tasks: Task[];
  loading: boolean;
  editingTask: string | null;

  // Actions
  setTasks: (tasks: Task) => void;
  setLoading: (loading: boolean) => void;
  setEditingTask: (id: string | null) => void;

  // Async actions
  fetchTasks: () => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (updatedTodo: Partial<Task>, id: string) => Promise<void>;
  moveTask: (
    cardId: string,
    column: ColumnType,
    beforeId: string
  ) => Promise<void>;
  moveTaskToEnd: (taskId: string) => Promise<void>;
  addTask: (task: Task) => void;
  moveTaskStackToEnd: (taskId: string) => void;
}

export type ColumnType =
  | "PENDING"
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "POSTPONED";

const useKanbanStore = create<KanbanState>((set, get) => ({
  // Initial state
  tasks: [],
  loading: false,
  editingTask: null,

  // Actions for updating state
  setTasks: (tasks: Task) => set({ tasks: [...get().tasks, tasks] }),
  setLoading: (loading) => set({ loading }),
  setEditingTask: (id) => set({ editingTask: id }),

  // Async actions that interact with the API
  fetchTasks: async () => {
    const response: AxiosResponse<Task[]> = await apiClient.get("/tasks");

    if (response.status === 200 || response.status === 201) {
      const mappedCards = response.data.map((task: Task) => ({
        title: task.title,
        id: task.id as string,
        column: task.status as ColumnType,
        description: task.description,
        date: task.date,
        createdAt: task.createdAt,
        employeeId: task.employeeId,
        isForAWeek: task.isForAWeek,
        priority: task.priority,
        status: task.status,
        updatedAt: task.updatedAt,
        userId: task.userId,
        user: task.user,
      }));

      set({ tasks: mappedCards });
    }
  },

  deleteTask: async (id: string) => {
    const { fetchTasks, setLoading } = get();
    setLoading(true);

    try {
      const response = await apiClient.delete(`/tasks/${id}`);

      if (response.status === 200 || response.status === 201) {
        message.success("Todo deleted successfully!");
        // Refresh the todos list
        await fetchTasks();
      } else {
        message.error("Failed to delete todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      message.error("Failed to delete todo");
    } finally {
      setLoading(false);
    }
  },

  updateTask: async (updatedTask: Partial<Task>, id: string) => {
    const { fetchTasks, setLoading, setEditingTask } = get();
    setLoading(true);

    try {
      const response = await apiClient.put(`/tasks/${id}`, updatedTask);

      if (response.status === 200 || response.status === 201) {
        message.success("Todo updated successfully!");
        // Reset editing state
        setEditingTask(null);
        // Refresh the todos list
        await fetchTasks();
      } else {
        message.error("Failed to update todo");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      message.error("Failed to update todo");
    } finally {
      setLoading(false);
    }
  },

  moveTask: async (taskId: string, column: ColumnType, beforeId: string) => {
    const { tasks, setLoading } = get();
    setLoading(true);

    try {
      let copy = [...tasks];
      let taskToTransfer = copy.find((c) => c.id === taskId);
      if (!taskToTransfer) return;

      // Update the task status in the backend
      const response = await apiClient.put(`/tasks/${taskToTransfer.id}`, {
        status: column,
      });

      if (response.status === 200 || response.status === 201) {
        message.success(
          `Task moved from ${taskToTransfer.column} to ${column}`
        );

        // Update the local state
        taskToTransfer = { ...taskToTransfer, column };
        copy = copy.filter((c) => c.id !== taskId);

        const moveToBack = beforeId === "-1";

        if (moveToBack) {
          copy.push(taskToTransfer);
        } else {
          const insertAtIndex = copy.findIndex((el) => el.id === beforeId);
          if (insertAtIndex === undefined) return;
          copy.splice(insertAtIndex, 0, taskToTransfer);
        }

        set({ tasks: copy });
      } else {
        message.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error moving task:", error);
      message.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  },

  moveTaskToEnd: async (taskId: string) => {
    try {
      // Remove the task from the array
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
      }));
      await apiClient.delete(`/tasks/${taskId}`);
      message.success("Task removed successfully");
    } catch (error) {
      console.error("Error removing task:", error);
      message.error("Failed to remove task");
    }
  },

  addTask: (task: Task) => {
    const mappedTask = {
      title: task.title,
      id: task.id as string,
      column: task.status as ColumnType,
      description: task.description,
      date: task.date,
      createdAt: task.createdAt,
      employeeId: task.employeeId,
      isForAWeek: task.isForAWeek,
      priority: task.priority,
      status: task.status,
      updatedAt: task.updatedAt,
      userId: task.userId,
    };

    set((state) => ({
      tasks: [...state.tasks, mappedTask],
    }));
  },

  moveTaskStackToEnd: (taskId: string) => {
    set((state) => {
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return state;

      const newTasks = [...state.tasks];
      const [task] = newTasks.splice(taskIndex, 1);
      newTasks.push(task);

      return { tasks: newTasks };
    });
  },
}));

export default useKanbanStore;
