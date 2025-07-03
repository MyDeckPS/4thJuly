
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireQuizCompletion?: boolean;
}

const ProtectedRoute = ({ children, requireQuizCompletion = false }: ProtectedRouteProps) => {
  const { user, loading, isFirstTimeUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-warm-sage border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the route requires quiz completion and user hasn't completed it
  if (requireQuizCompletion && isFirstTimeUser === true) {
    return <Navigate to="/enhanced-quiz" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
