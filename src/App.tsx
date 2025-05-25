import { Suspense } from "react";
import { UserProvider } from "./context/useUserContext";
import { Approuter } from "./router/Approuter";
import { App as AntdApp } from "antd";

import "./App.css";

function App() {
  return (
    <UserProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AntdApp>
          <Approuter />
        </AntdApp>
      </Suspense>
    </UserProvider>
  );
}

export default App;
