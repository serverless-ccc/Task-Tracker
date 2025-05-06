import React, { useState, DragEvent } from "react";
import { Trash2, Flame, PlusIcon, WandSparkles } from "lucide-react";
import { motion } from "framer-motion";

import TrelloCard from "../Card";
import useKanbanStore, { ColumnType, Task } from "../../store/useKanbanStore";
import { useKanban } from "./useKanban";
import { Form, FormInstance, Button, Select, Modal, DatePicker } from "antd";
import { priorityOptions } from "../../utils/options";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";

export const Kanban = () => {
  const {
    form,
    handleSubmit,
    editingTaskForm,
    editingTask,
    handleEdit,
    updateTask,
  } = useKanban();
  return (
    <div className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board
        form={form}
        handleSubmit={handleSubmit}
        editingTaskForm={editingTaskForm}
        editingTask={editingTask as Task}
        handleEdit={handleEdit}
        updateTask={updateTask}
      />
    </div>
  );
};

const Board = ({
  form,
  handleSubmit,
  editingTaskForm,
  editingTask,
  handleEdit,
  updateTask,
}: {
  form: FormInstance;
  handleSubmit: (values: Task) => void;
  editingTaskForm: FormInstance;
  editingTask: Task;
  handleEdit: (task: Task) => void;
  updateTask: () => void;
}) => {
  const { tasks, setTasks } = useKanbanStore();

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll px-12">
      <Column
        title="Pending"
        column="PENDING"
        headingColor="text-neutral-100"
        cards={tasks}
        setCards={setTasks}
        form={form}
        handleSubmit={handleSubmit}
        editingTaskForm={editingTaskForm}
        editingTask={editingTask}
        handleEdit={handleEdit}
        updateTask={updateTask}
      />
      <Column
        title="Not started"
        column="NOT_STARTED"
        headingColor="text-yellow-200"
        cards={tasks}
        setCards={setTasks}
        form={form}
        handleSubmit={handleSubmit}
        editingTaskForm={editingTaskForm}
        editingTask={editingTask}
        handleEdit={handleEdit}
        updateTask={updateTask}
      />
      <Column
        title="In progress"
        column="IN_PROGRESS"
        headingColor="text-blue-200"
        cards={tasks}
        setCards={setTasks}
        form={form}
        handleSubmit={handleSubmit}
        editingTaskForm={editingTaskForm}
        editingTask={editingTask}
        handleEdit={handleEdit}
        updateTask={updateTask}
      />
      <Column
        title="Complete"
        column="COMPLETED"
        headingColor="text-emerald-200"
        cards={tasks}
        setCards={setTasks}
        form={form}
        handleSubmit={handleSubmit}
        editingTaskForm={editingTaskForm}
        editingTask={editingTask}
        handleEdit={handleEdit}
        updateTask={updateTask}
      />
      <BurnBarrel />
    </div>
  );
};

type ColumnProps = {
  title: string;
  headingColor: string;
  cards: Task[];
  column: ColumnType;
  setCards: (tasks: Task) => void;
  form: FormInstance;
  handleSubmit: (values: Task) => void;
  editingTaskForm: FormInstance;
  editingTask: Task;
  handleEdit: (task: Task) => void;
  updateTask: () => void;
};

const Column = ({
  title,
  headingColor,
  cards,
  column,
  form,
  handleSubmit,
  editingTaskForm,
  editingTask,
  handleEdit,
  updateTask,
}: ColumnProps) => {
  const [active, setActive] = useState(false);
  const { moveTask } = useKanbanStore();

  const handleDragStart = (e: DragEvent, card: Task) => {
    e.dataTransfer.setData("cardId", card.id as string);
  };

  const handleDragEnd = async (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";
    moveTask(cardId, column, before);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    highlightIndicator(e);

    setActive(true);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: DragEvent) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: DragEvent, indicators: HTMLElement[]) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(
      document.querySelectorAll(
        `[data-column="${column}"]`
      ) as unknown as HTMLElement[]
    );
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div
      className="w-56 shrink-0 min-h-[90vh]"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="mb-3 flex items-center justify-between sticky top-0 bg-neutral-900 z-10 pt-6">
        <div className="flex items-center justify-between w-full px-3 py-2 bg-black/50 rounded-lg">
          <h3 className={`font-medium ${headingColor}`}>{title}</h3>
          <div className="flex items-center justify-end">
            <AddCard column={column} form={form} handleSubmit={handleSubmit} />
          </div>
        </div>
        {/* <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span> */}
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return (
            <Card
              key={c.id}
              {...c}
              handleDragStart={handleDragStart}
              editingTaskForm={editingTaskForm}
              editingTask={editingTask}
              handleEdit={handleEdit}
              updateTask={updateTask}
            />
          );
        })}
        <DropIndicator beforeId={null} column={column} />
      </div>
    </div>
  );
};

type CardProps = Task & {
  handleDragStart: (e: React.DragEvent, card: Task) => void;
  editingTaskForm: FormInstance;
  editingTask: Task;
  handleEdit: (task: Task) => void;
  updateTask: () => void;
};

const Card = ({
  title,
  description,
  id,
  column,
  date,
  createdAt,
  employeeId,
  isForAWeek,
  priority,
  status,
  updatedAt,
  userId,
  handleDragStart,
  editingTaskForm,
  editingTask,
  handleEdit,
  updateTask,
}: CardProps) => {
  const cardData = {
    title,
    description,
    id,
    column,
    date,
    createdAt,
    employeeId,
    isForAWeek,
    priority,
    status,
    updatedAt,
    userId,
  };

  const deleteTask = useKanbanStore((state) => state.deleteTask);

  return (
    <>
      <DropIndicator beforeId={id as string} column={column as string} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        // @ts-expect-error drag event mismatch
        onDragStart={(e: React.DragEvent) =>
          handleDragStart(e, { title, id, column })
        }
        className="cursor-grab  active:cursor-grabbing"
      >
        <TrelloCard
          cardData={cardData as Task}
          editingTaskForm={editingTaskForm}
          editingTodo={editingTask as string}
          handleEdit={() => handleEdit(cardData as Task)}
          handleDelete={() => deleteTask(id as string)}
          updateTodo={updateTask}
        />
      </motion.div>
    </>
  );
};

type DropIndicatorProps = {
  beforeId: string | null;
  column: string;
};

const DropIndicator = ({ beforeId, column }: DropIndicatorProps) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
    />
  );
};

const BurnBarrel = () => {
  const [active, setActive] = useState(false);
  const { moveTaskToEnd } = useKanbanStore();
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const handleDragLeave = () => {
    setActive(false);
  };

  const handleDragEnd = (e: DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");
    moveTaskToEnd(cardId);

    setActive(false);
  };

  return (
    <div
      onDrop={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
        active
          ? "border-red-800 bg-red-800/20 text-red-500"
          : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
      }`}
    >
      {active ? <Flame className="animate-bounce" /> : <Trash2 />}
    </div>
  );
};

type AddCardProps = {
  column: ColumnType;
  form: FormInstance;
  handleSubmit: (values: Task) => void;
};

const AddCard = ({ column, form, handleSubmit }: AddCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  form.setFieldValue("status", column);

  return (
    <>
      <Button
        type="default"
        onClick={() => setIsModalOpen(true)}
        icon={<PlusIcon size={14} />}
      />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={false}
        title={`Add Task to ${column}`}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            handleSubmit(values);
            setIsModalOpen(false);
          }}
          initialValues={{
            priority: "MEDIUM",
            date: dayjs(), // Get today's date using dayjs
          }}
          // disabled={editingTodo !== null}
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: "Please enter a title" }]}
              >
                <TextArea rows={4} placeholder="Enter Your Task" />
              </Form.Item>
              <Button
                // onClick={handleElaborate}
                // loading={loadingAI}
                icon={<WandSparkles size={12} />}
                className="mb-4"
              >
                Elaborate with AI
              </Button>
            </div>

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
                rows={4}
                placeholder="You dont have to enter a description just click elaborate with AI"
              />
            </Form.Item>
          </div>

          <div className="grid xl:grid-cols-3 grid-cols-1 gap-4">
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
              <Select placeholder="Select priority" options={priorityOptions} />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please select a date" }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </div>
          <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
            <div></div>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusIcon size={14} />}
                block
                className="!w-fit ml-auto !flex"
              >
                Add Task
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};
