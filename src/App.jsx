import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Foodaccess from "./pages/Foodaccess";
import Routine from "./pages/Routine";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import Memory from "./pages/Memory";
import Analytics from "./pages/Analytics";
import AI from "./pages/AI";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/foodaccess" element={<Foodaccess />} />
        <Route path="/routine" element={<Routine />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/memory" element={<Memory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AI />} />
      </Routes>
    </Layout>
  );
}