import { Route, Routes, useNavigate } from "react-router-dom";
import "./index.css";

//Pages Import
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import AuthRequiredRoutes from "./lib/AuthRequiredRoutes";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AuthRequiredRoutes />}>
          <Route path="/home" element={<Dashboard />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
