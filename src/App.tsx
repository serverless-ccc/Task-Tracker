import "./App.css";
import DailyTaskTypeform from "./form/Form";

import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <DailyTaskTypeform />
      </div>
    </BrowserRouter>
  );
}

export default App;
