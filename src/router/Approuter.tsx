import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "../pages/home/Home";
import { Kanban } from "../components/kanban/Kanban";
import Layout from "./Layout";
const Dashboard = lazy(() => import("../components/dashboard/Dashboard"));
const LoginForm = lazy(() => import("../components/login/Login"));

// Lazy load new components
const Notes = lazy(() => import("../components/notes/Notes"));
const Issues = lazy(() => import("../components/issues/Issues"));

export const Approuter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/tasks",
          element: <Kanban />,
        },
        {
          path: "/notes",
          element: <Notes />,
        },
        {
          path: "/issues",
          element: <Issues />,
        },
      ],
    },
    {
      path: "/login",
      element: <LoginForm />,
    },
  ]);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default Approuter;
