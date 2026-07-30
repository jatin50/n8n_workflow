import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    if (status === "idle") {
      fetchMe();
    }
  }, [status, fetchMe]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
