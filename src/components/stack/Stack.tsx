import { Select } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import TrelloCard from "../Card";
import useKanbanStore, { Task } from "../../store/useKanbanStore";
import { priorityOptions, statusOptions } from "../../utils/options";
import { Grid, List } from "lucide-react";
import dayjs from "dayjs";

const { Option } = Select;

const CARD_COLORS = ["#266678", "#cb7c7a", "#36a18b", "#cda35f", "#747474"];
const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.06;

export const CardStack = () => {
  const tasks = useKanbanStore((state) => state.tasks);
  const fetchTasks = useKanbanStore((state) => state.fetchTasks);
  const moveTaskStackToEnd = useKanbanStore(
    (state) => state.moveTaskStackToEnd
  );

  const [selectedUser, setSelectedUser] = useState<string>("All");
  const [priority, setPriority] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [gridView, setGridView] = useState<boolean>(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Group tasks by user if not "All", otherwise use the flat list
  const groupedTasks: Record<string, Task[]> = {};
  tasks.forEach((task) => {
    const name = task.user?.name || "Unknown";
    if (!groupedTasks[name]) {
      groupedTasks[name] = [];
    }
    groupedTasks[name].push(task);
  });

  const userNames = Object.keys(groupedTasks);

  const filteredAndSorted = (taskList: Task[]) => {
    return taskList.filter((task) => {
      const matchesPriority = priority === "All" || task.priority === priority;
      const matchesStatus = status === "All" || task.status === status;
      return matchesPriority && matchesStatus;
    });
  };

  // Render task stack for a single user or for all users
  const renderTaskStack = (tasks: Task[], isGrouped: boolean = false) => {
    const visibleTasks = filteredAndSorted(tasks);
    if (visibleTasks.length === 0) return null;

    return (
      <div style={{ marginBottom: "2rem" }}>
        {!isGrouped && <h3 style={{ marginLeft: "1rem" }}>All Tasks</h3>}
        {gridView ? (
          <>
            <div className="grid grid-cols-12 gap-4">
              {visibleTasks.map((todo) => (
                <TrelloCardWithBorder
                  key={todo.id}
                  title={todo.title as string}
                  description={todo.description}
                  labels={[todo.priority as string, todo.status as string]}
                  dueDate={todo.createdAt}
                  name={todo.user?.name}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={wrapperStyle}>
            <ul style={cardWrapStyle}>
              {visibleTasks.map((todo, index) => {
                const canDrag = index === 0;
                return (
                  <motion.li
                    key={todo.id}
                    style={{
                      ...cardStyle,
                      cursor: canDrag ? "grab" : "auto",
                    }}
                    animate={{
                      top: index * -CARD_OFFSET,
                      scale: 1 - index * SCALE_FACTOR,
                      zIndex: CARD_COLORS.length - index,
                    }}
                    drag={canDrag ? "y" : false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    onDragEnd={() => moveTaskStackToEnd(todo.id as string)}
                  >
                    <TrelloCard key={todo.id} cardData={todo as Task} />
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center">
        <Select
          style={{ width: 180 }}
          value={selectedUser}
          onChange={(val) => setSelectedUser(val)}
        >
          <Option value="All">All Users</Option>
          {userNames.map((name) => (
            <Option key={name} value={name}>
              {name}
            </Option>
          ))}
        </Select>

        <Select
          style={{ width: 140 }}
          value={priority}
          onChange={(val) => setPriority(val)}
          options={priorityOptions}
        />

        <Select
          style={{ width: 160 }}
          value={status}
          onChange={(val) => setStatus(val)}
          options={statusOptions}
        />
        {gridView ? (
          <Grid
            onClick={() => setGridView(false)}
            className="cursor-pointer"
            size={20}
          />
        ) : (
          <List
            onClick={() => setGridView(true)}
            className="cursor-pointer"
            size={20}
          />
        )}
      </div>
      {/* Render Task Stacks */}
      {selectedUser === "All"
        ? renderTaskStack(tasks) // Render all tasks as one stack
        : selectedUser in groupedTasks &&
          renderTaskStack(groupedTasks[selectedUser], true)}{" "}
      {/* Grouped by user */}
    </div>
  );
};

interface TrelloCardProps {
  title: string;
  description?: string;
  labels?: string[];
  dueDate?: string;
  name?: string;
}
export const TrelloCardWithBorder: React.FC<TrelloCardProps> = ({
  title,
  description,
  labels = [],
  dueDate,
  name,
}) => {
  return (
    <div className="bg-white p-4 col-span-3 rounded-2xl shadow-md hover:shadow-lg transition-all w-full max-w-sm">
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
        {name && <span className="text-xs text-gray-500">{name}</span>}

        {dueDate && (
          <span className="text-xs text-gray-500">
            📅 {dayjs(dueDate).format("DD MMM YYYY")}
          </span>
        )}
      </div>
    </div>
  );
};

const wrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardWrapStyle: React.CSSProperties = {
  position: "relative",
  maxWidth: "350px",
  width: "300px",
  height: "350px",
};

const cardStyle: React.CSSProperties = {
  position: "absolute",
  maxWidth: "350px",
  width: "300px",
  height: "350px",
  borderRadius: "8px",
  transformOrigin: "top center",
  listStyle: "none",
};
