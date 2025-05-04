import { Layout, Spin } from "antd";

import MainContent from "../dashboard/MainContent";

const { Content } = Layout;

const Dashboard: React.FC = () => {
  return (
    <Spin spinning={false}>
      <Layout className="min-h-screen bg-gray-100 p-4 flex flex-col md:flex-row gap-4">
        <Content>
          <MainContent />
        </Content>
      </Layout>
    </Spin>
  );
};

export default Dashboard;
