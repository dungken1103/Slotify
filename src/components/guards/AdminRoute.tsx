import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../middlewares/useAuthStore";

export function AdminRoute() {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "ADMIN") {
        // If authenticated but not admin, redirect to home
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
