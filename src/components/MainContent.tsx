import { FormInstance } from "antd";
import { getTimeOfDay } from "../utils/greeting";
import TrelloCard, { CardData } from "./Card";
import { Todo, FormValues } from "./form/usetask";

const MainContent = ({
  handleDelete,
  todos,
  handleEdit,
  editingTaskForm,
  editingTodo,
  updateTodo,
}: {
  handleDelete: (id: string) => void;
  todos: { inProgress: Todo[]; pending: Todo[]; completed: Todo[] };
  handleEdit: (todo: Todo) => void;
  editingTaskForm: FormInstance<FormValues>;
  editingTodo: string | null;
  updateTodo: () => void;
}) => {
  return (
    <div className="flex-1 bg-white p-4 rounded-md shadow-sm">
      <h1 className="text-2xl font-bold m-0">
        Good {getTimeOfDay()}{" "}
        {/* <span className="capitalize">{name} (🗂️ Your tasks)</span> */}
      </h1>

      <div className="grid xl:grid-cols-3 grid-cols-1 gap-4 mt-4">
        <div className="bg-gray-200 px-4 py-4 rounded-lg max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-normal">In Progress Tasks</h2>
          <div className="flex flex-col gap-4 mt-4">
            {todos.inProgress.map((todo: Todo) => (
              <TrelloCard
                key={todo.id}
                cardData={todo as CardData}
                handleDelete={() => handleDelete(todo.id as string)}
                handleEdit={() => handleEdit(todo)}
                editingTaskForm={editingTaskForm}
                editingTodo={editingTodo}
                updateTodo={updateTodo}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-200 px-4 py-4 rounded-lg max-h-[65vh] overflow-y-auto">
          <h2 className="text-lg font-normal">Pending Tasks</h2>
          <div className="flex flex-col gap-4 mt-4">
            {todos.pending.map((todo) => (
              <TrelloCard
                key={todo.id}
                cardData={todo as CardData}
                handleDelete={() => handleDelete(todo.id as string)}
                handleEdit={() => handleEdit(todo)}
                editingTaskForm={editingTaskForm}
                editingTodo={editingTodo}
                updateTodo={updateTodo}
              />
            ))}
          </div>
        </div>
        <div className="bg-gray-200 px-4 py-4 rounded-lg max-h-[65vh] overflow-y-auto">
          <h2 className="text-lg font-normal">Completed Tasks</h2>
          <div className="flex flex-col gap-4 mt-4">
            {todos.completed.map((todo) => (
              <TrelloCard
                key={todo.id}
                cardData={todo as CardData}
                handleDelete={() => handleDelete(todo.id as string)}
                handleEdit={() => handleEdit(todo)}
                editingTaskForm={editingTaskForm}
                editingTodo={editingTodo}
                updateTodo={updateTodo}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
