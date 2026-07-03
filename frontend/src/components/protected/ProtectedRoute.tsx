// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { user, loading } = useAuth(); // Assuming user object has a 'role' property

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-obsidian">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gemini-blue border-t-transparent"></div>
      </div>
    );
  }

  // 1. Not logged in? Send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // 2. Authorized! Render child components
  return <Outlet />;
};

export default ProtectedRoute;
