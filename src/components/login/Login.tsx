import React from "react";
import { Form, Input, Button, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLogin } from "./useLogin";

const LoginForm: React.FC = () => {
  const [form] = Form.useForm();

  const { onFinish } = useLogin();

  return (
    <Card
      title="Login"
      style={{ maxWidth: 400, margin: "0 auto", marginTop: 50 }}
    >
      <Form
        form={form}
        name="login"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please input a valid email!" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            size="large"
            type="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            Log in
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginForm;
