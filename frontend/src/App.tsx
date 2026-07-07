import "./index.css";
// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/protected/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import SearchPage from "./components/views/SearchPage";
import DashboardLayout from "./layout/DashboardLayout";
import DashboardHome from "./components/views/DashboardHome";
import ChatWindow from "./components/views/ChatWindow";
import { ConversationProvider } from "./context/ConversationContext";
// import SearchPage from "./layout/SearchPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Optional styling to match your dark/obsidian theme
          style: {
            background: "#1e1e24",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <ConversationProvider>
                <DashboardLayout />
              </ConversationProvider>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="/home" element={<DashboardHome />} />
            <Route path="/chat/:conversationId" element={<ChatWindow />} />
            <Route path="/dashboard/search" element={<SearchPage />} />
          </Route>
        </Route>

        {/* Catch-all: Redirect to dashboard if logged in, or login if not */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
