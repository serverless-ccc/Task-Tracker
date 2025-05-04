import React, { Suspense } from "react";
import "./App.css";
import { UserProvider } from "./context/useUserContext";
import { createBrowserRouter, RouterProvider } from "react-router";

const Dashboard = React.lazy(() => import("./components/dashboard/Dashboard"));
const LoginForm = React.lazy(() => import("./components/login/Login"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
]);

function App() {
  return (
    <UserProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </UserProvider>
  );
}

export default App;
