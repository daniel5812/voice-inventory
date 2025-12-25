import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import PublicOnly from "./components/PublicOnly";
import Layout from "./components/AppLayout";

import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/Inventory";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ציבורי */}
        <Route
          path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnly>
              <RegisterPage />
            </PublicOnly>
          }
        />

        {/* מוגן */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
