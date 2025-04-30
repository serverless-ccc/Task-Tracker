import { Button, Form, FormInstance, Select } from "antd";
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined, RobotOutlined } from "@ant-design/icons";
// import { Todo } from "./Form";
import { priorityOptions } from "../../utils/options";
import { statusOptions } from "../../utils/options";
import { Todo } from "./usetask";

const Task = ({
  form,
  handleSubmit,
  handleElaborate,
  loadingAI,
  setStep,
}: {
  form: FormInstance;
  handleSubmit: (values: Todo) => void;
  handleElaborate: () => void;
  loadingAI: boolean;
  setStep: (step: number) => void;
}) => {
  return (
    <div className="max-h-[65vh] overflow-y-auto">
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
          rules={[{ required: true, message: "Please enter a title" }]}
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
          <TextArea rows={6} placeholder="Enter detailed description" />
        </Form.Item>

        <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
          <Form.Item
            name="status"
            label="Status"
            rules={[
              {
                required: true,
                message: "Please select a status",
              },
            ]}
          >
            <Select placeholder="Select status" options={statusOptions} />
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
            <Select placeholder="Select priority" options={priorityOptions} />
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
    </div>
  );
};

export default Task;
