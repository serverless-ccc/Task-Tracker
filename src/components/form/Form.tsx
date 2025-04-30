import {
  DatePicker,
  Button,
  Collapse,
  Steps,
  Layout,
  Spin,
  Switch,
} from "antd";

import MainContent from "../MainContent";
import Task from "./Task";
import { useTask } from "./usetask";

const { Step } = Steps;
const { Content } = Layout;

const TodoForm: React.FC = () => {
  const {
    form,
    todos,
    isForAWeek,
    step,
    date,
    loadingAI,
    editingTodo,
    editingTaskForm,
    handleNextStep,
    handleSubmit,
    handleDelete,
    handleElaborate,
    handleEdit,
    loading,
    setStep,
    setDate,
    setIsForAWeek,
    updateTodo,
  } = useTask();

  return (
    <Spin spinning={loading}>
      <Layout className="min-h-screen bg-gray-100 p-4 flex flex-col md:flex-row gap-4">
        <Collapse
          className="w-full md:min-w-[450px] md:max-w-[450px] bg-white rounded-md shadow-sm"
          defaultActiveKey={["1"]}
          items={[
            {
              key: "1",
              label: "📝 Create Your Tasks",
              children: (
                <>
                  <Steps
                    current={step}
                    direction="vertical"
                    size="small"
                    className="mb-6"
                  >
                    <Step title="Set Duration & Date" />
                    <Step title="Enter Tasks" />
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
                    <Task
                      form={form}
                      handleSubmit={handleSubmit}
                      handleElaborate={handleElaborate}
                      loadingAI={loadingAI}
                      setStep={setStep}
                    />
                  )}
                </>
              ),
            },
          ]}
        />

        <Content>
          <MainContent
            handleDelete={handleDelete}
            todos={todos}
            handleEdit={handleEdit}
            editingTaskForm={editingTaskForm}
            editingTodo={editingTodo}
            updateTodo={updateTodo}
          />
        </Content>
      </Layout>
    </Spin>
  );
};

export default TodoForm;
