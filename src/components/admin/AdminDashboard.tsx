import { useEffect } from "react";
import useKanbanStore from "../../store/useKanbanStore";
import dayjs from "dayjs";
import clsx from "clsx";
import { Avatar } from "antd";

const AdminDashboard: React.FC = () => {
  const tasks = useKanbanStore((state) => state.tasks);
  const fetchTasks = useKanbanStore((state) => state.fetchTasks);

  const tasksToday = tasks.filter((task) => {
    const created = new Date(task.createdAt as string);
    const now = new Date();
    return (
      created.getFullYear() === now.getFullYear() &&
      created.getMonth() === now.getMonth() &&
      created.getDate() === now.getDate()
    );
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="md:col-span-4 col-span-12 bg-gray-900 text-white p-6 rounded-3xl shadow-lg">
        <h2 className="text-xl font-normal mb-6">Overall Information</h2>

        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-4xl font-medium">{tasks?.length}</span>
            <p className="text-gray-400 xl:text-sm text-[12px] font-bold">
              Tasks done for all time
            </p>
          </div>
          <div>
            <span className="text-4xl font-medium">
              {tasks?.filter((task) => task.status === "CANCELLED").length}
            </span>
            <p className="text-gray-400 xl:text-sm text-[12px] font-bold">
              tasks are stopped
            </p>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 grid-cols-2 gap-4">
          <div className="bg-gray-800 col-span-1 p-4 rounded-lg text-center">
            <span className="text-3xl font-medium block">
              {tasks?.filter((task) => task.status === "IN_PROGRESS").length}
            </span>
            <span className="text-gray-400 xl:text-sm text-[12px] font-bold">
              Ongoing
            </span>
          </div>
          <div className="bg-gray-800 col-span-1 p-4 rounded-lg text-center">
            <span className="text-3xl font-medium block">
              {tasks?.filter((task) => task.status === "PENDING").length}
            </span>
            <span className="xl:text-sm text-[12px] font-bold text-gray-400 whitespace-nowrap">
              In Progress
            </span>
          </div>
          <div className="bg-gray-800 col-span-1 p-4 rounded-lg text-center hidden md:block">
            <span className="text-3xl font-medium block">
              {tasks?.filter((task) => task.status === "COMPLETED").length}
            </span>
            <span className="text-gray-400 xl:text-sm text-[12px] font-bold">
              Completed
            </span>
          </div>
        </div>
      </div>
      <div className="md:col-span-8 col-span-12 bg-gray-50 w-full rounded-3xl p-6">
        <h2 className="text-xl font-normal mb-6">Todays Tasks</h2>
        <div className="grid grid-cols-2 gap-4">
          {tasksToday?.slice(0, 4).map((task) => (
            <TrelloCardWithBorder
              key={task.id}
              title={task.title as string}
              description={task.description}
              labels={["Design", "Urgent"]}
              dueDate={task.createdAt}
              avatarUrl={task.user?.picture}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TrelloCardProps {
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
  avatarUrl?: string;
  name?: string;
}

export const TrelloCardWithBorder: React.FC<TrelloCardProps> = ({
  title,
  description,
  labels = [],
  dueDate,
  name,
}) => {
  const limitWords = (text: string, limit: number) => {
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "COMPLETED":
        return "border-t-green-500";
      case "IN_PROGRESS":
        return "border-t-blue-500";
      case "PENDING":
        return "border-t-yellow-500";
      default:
        return "border-t-gray-500";
    }
  };

  return (
    <div
      className={clsx(
        "bg-white min-h-[180px] relative p-4 col-span-1 border-t-4 rounded-br-2xl rounded-bl-2xl shadow-md hover:shadow-lg transition-all w-full max-w-sm",
        getPriorityColor(labels[1])
      )}
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {labels.map((label, idx) => (
          <span
            key={idx}
            className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium"
          >
            {label}
          </span>
        ))}
      </div>

      <h3 className="font-semibold text-lg text-gray-800 mt-4 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden text-ellipsis">
          {limitWords(description, 10)}
        </p>
      )}

      <div className="flex justify-between items-center mt-4 w-full absolute bottom-0 left-0 px-4 py-4">
        {name && (
          <span className="text-xs text-gray-500">
            <Avatar src={name} />
          </span>
        )}

        {dueDate && (
          <span className="text-xs text-gray-500">
            📅 {dayjs(dueDate).format("DD MMM YYYY")}
          </span>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
