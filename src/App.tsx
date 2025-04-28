import React, { Suspense } from "react";
import "./App.css";
import DailyTaskTypeform from "./components/form/Form";
import { UserProvider } from "./context/useUserContext";

import { BrowserRouter, Route, Routes } from "react-router-dom";
const Submitted = React.lazy(() => import("./components/form/Submitted"));
const LoginForm = React.lazy(() => import("./components/login/Login"));

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<DailyTaskTypeform />} />
            <Route path="/submited" element={<Submitted />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </Suspense>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
