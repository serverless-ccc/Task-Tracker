import { ConfigProvider, Tabs } from "antd";
import type { TabsProps } from "antd";

import AddTask from "./AddTask";

const QuickAdd: React.FC<{
  setIsModalOpen: React.Dispatch<
    React.SetStateAction<{
      task?: boolean;
      issue?: boolean;
    }>
  >;
}> = ({ setIsModalOpen }) => {
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Task",
      children: <AddTask setIsModalOpen={setIsModalOpen} />,
    },
    {
      key: "2",
      label: "Issue",
      children: "Content of Tab Pane 2",
    },
    {
      key: "3",
      label: "Quick Task",
      children: "Content of Tab Pane 3",
    },
    {
      key: "4",
      label: "Note",
      children: "Content of Tab Pane 3",
    },
  ];

  return (
    <div className="-mt-4">
      <ConfigProvider
        theme={{
          components: {
            Input: {
              colorBorder: "transparent",
              activeBorderColor: "transparent",
              activeShadow: "none",
              hoverBg: "#f2f2f2",
              hoverBorderColor: "transparent",
              activeBg: "#f2f2f2",
            },
            Form: {
              itemMarginBottom: 0,
            },
          },
          token: {
            fontSize: 12,
          },
        }}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </ConfigProvider>
    </div>
  );
};

export default QuickAdd;
