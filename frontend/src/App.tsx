import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import VoiceTester from "./pages/VoiceTester";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* דף הבית */}
        <Route path="/" element={<Dashboard />} />

        {/* מסך בדיקת פקודות קוליות */}
        <Route path="/voice-test" element={<VoiceTester />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
