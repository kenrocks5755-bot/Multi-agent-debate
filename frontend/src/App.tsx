import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Debate from "./pages/Debate";
import Summary from "./pages/Summary";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/debate" element={<Debate />} />
      <Route path="/summary" element={<Summary />} />
    </Routes>
  );
}
