import { useForm } from "antd/lib/form/Form";
import { useNavigate } from "react-router";
import useUserStore from "../../store/useUserStore";
import { useEffect } from "react";
export const useLogin = () => {
  const [loginForm] = useForm();
  const { profile } = useUserStore();

  const navigate = useNavigate();

  const onFinish = (values: any) => {
    console.log(values);
    // const body = {
    //   email: values.email,
    //   password: values.password,
    // };
    // api.post("/login", body).then((res) => {
    //   console.log(res);
    // });
  };

  // useEffect(() => {
  //   if (profile) {
  //     navigate("/");
  //   }
  // }, [profile, navigate]);

  return { loginForm, onFinish };
};
