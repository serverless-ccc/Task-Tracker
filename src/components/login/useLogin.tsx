import { message } from "antd";
import apiClient from "../../api/_setup";
import useUserStore from "../../store/useUserStore";
import { UserProfile } from "../../context/useUserContext";
import { useNavigate } from "react-router-dom";

// interface LoginState {
//   email: string;
//   password: string;
// }

interface LoginFormValues {
  email: string;
  password: string;
}

export const useLogin = () => {
  const { setProfile, setToken, setLoading } = useUserStore();

  const navigate = useNavigate();

  const onFinish = (values: LoginFormValues) => {
    message.open({
      type: "loading",
      content: "Logging in...",
      key: "login",
    });

    apiClient
      .post("users/login", values)
      .then((res) => {
        const { token, user } = res.data as {
          token: string;
          user: UserProfile;
        };
        setToken(token);
        setProfile(user);
        setLoading(false);
        message.open({
          type: "success",
          content: "Login successful",
          key: "login",
        });
        navigate("/");
      })
      .catch(() => {
        message.open({
          type: "error",
          content: "Login failed",
          key: "login",
        });
      });
  };

  return {
    onFinish,
  };
};
