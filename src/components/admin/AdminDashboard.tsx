import { useEffect } from "react";
import useKanbanStore from "../../store/useKanbanStore";
import dayjs from "dayjs";

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
      <div className="col-span-4 bg-gray-900 text-white p-6 rounded-3xl shadow-lg">
        <h2 className="text-xl font-normal mb-6">Overall Information</h2>

        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-4xl font-medium">{tasks?.length}</span>
            <p className="text-gray-400 text-sm">Tasks done for all time</p>
          </div>
          <div>
            <span className="text-4xl font-medium">
              {tasks?.filter((task) => task.status === "CANCELLED").length}
            </span>
            <p className="text-gray-400 text-sm">tasks are stopped</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <span className="text-3xl font-medium block">
              {tasks?.filter((task) => task.status === "IN_PROGRESS").length}
            </span>
            <span className="text-gray-400">Ongoing</span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <span className="text-3xl font-medium block">
              {tasks?.filter((task) => task.status === "PENDING").length}
            </span>
            <span className="text-sm text-gray-400 whitespace-nowrap">
              In Progress
            </span>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <span className="text-3xl font-medium block">
              {tasks?.filter((task) => task.status === "COMPLETED").length}
            </span>
            <span className="text-gray-400">Completed</span>
          </div>
        </div>
      </div>
      <div className="col-span-8 bg-gray-50 w-full rounded-3xl p-6">
        <h2 className="text-xl font-normal mb-6">Todays Tasks</h2>
        <div className="grid grid-cols-3 gap-4">
          {tasksToday?.slice(0, 3).map((task) => (
            <TrelloCard
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
}

export const TrelloCard: React.FC<TrelloCardProps> = ({
  title,
  description,
  labels = [],
  dueDate,
  avatarUrl,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all w-full max-w-sm">
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

      <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      )}

      <div className="flex justify-between items-center mt-4">
        <img
          src={avatarUrl || "https://i.pravatar.cc/40"}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />

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
