import React, { Suspense } from "react";
import "./App.css";
import DailyTaskTypeform from "./form/Form";

import { BrowserRouter, Route, Routes } from "react-router-dom";
const Submitted = React.lazy(() => import("./form/Submitted"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<DailyTaskTypeform />} />
          <Route path="/submited" element={<Submitted />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
