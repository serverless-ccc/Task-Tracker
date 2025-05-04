import { useForm } from "antd/lib/form/Form";

type FormValues = {
  email: string;
  password: string;
};
export const useLogin = () => {
  const [loginForm] = useForm();

  const onFinish = (values: FormValues) => {
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
