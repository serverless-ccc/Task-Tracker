import React from "react";
import { Form, Input, Button, Card, message, Checkbox } from "antd";
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";

interface SignUpFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const SignUpForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = (values: SignUpFormValues) => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Form values:", values);
      message.success("Account created successfully!");
      setLoading(false);
      form.resetFields();
      // Here you would typically:
      // - Send registration data to your API
      // - Handle the response (success/failure)
      // - Redirect to login or show error message
    }, 1500);
  };

  return (
    <Card
      title="Create an Account"
      style={{ maxWidth: 400, margin: "0 auto", marginTop: 50 }}
    >
      <Form
        form={form}
        name="signup"
        layout="vertical"
        onFinish={onFinish}
        scrollToFirstError
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "Please input your username!" },
            { min: 3, message: "Username must be at least 3 characters" },
            {
              whitespace: true,
              message: "Username cannot contain only whitespace",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email address" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="agreeToTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error("You must accept the terms and conditions")
                    ),
            },
          ]}
        >
          <Checkbox>
            I agree to the <a href="#">Terms and Conditions</a> and{" "}
            <a href="#">Privacy Policy</a>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SignUpForm;
