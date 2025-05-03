import { BrowserRouter as Router, Routes, Route } from "react-router";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/Layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Filieres from "./pages/Filieres";
import Profile from "./pages/Profile";
import Salles from "./pages/Salles";
import Modules from "./pages/Modules";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/protectedRoute";
import { ThemeProvider } from "./components/theme-provider";
import Edt from "./pages/Edt";
import EditEdt from "./pages/edit";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route index element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/filieres"
              element={
                <ProtectedRoute>
                  <Filieres />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salles"
              element={
                <ProtectedRoute>
                  <Salles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <Modules />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edt"
              element={
                <ProtectedRoute>
                  <Edt />
                </ProtectedRoute>
              }
            />

            <Route
              path="/editEdt"
              element={
                <ProtectedRoute>
                  <EditEdt />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
