import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RightNow } from "./pages/RightNow";
import { Capture } from "./pages/Capture";
import { DomainDashboard } from "./pages/DomainDashboard";
import { TaskDetail } from "./pages/TaskDetail";
import { Wins } from "./pages/Wins";
import { Feel } from "./pages/Feel";
import { Settings } from "./pages/Settings";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RightNow />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/domains/:domain" element={<DomainDashboard />} />
        <Route path="/task/:id" element={<TaskDetail />} />
        <Route path="/wins" element={<Wins />} />
        <Route path="/feel" element={<Feel />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
