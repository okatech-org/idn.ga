import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, AppRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  requiredRole?: AppRole;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role → redirect to dashboard
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/profil" replace />;
  }

  return <Outlet />;
}
