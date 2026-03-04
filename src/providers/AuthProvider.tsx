import { useEffect } from "react";
import { useAuthStore } from "../middlewares/useAuthStore";
import { AuthService } from "../services/auth.service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { token, isAuthenticated, updateUser, clearAuth } = useAuthStore();

    useEffect(() => {
        const verifySession = async () => {
            if (token && isAuthenticated) {
                try {
                    const response = await AuthService.getMe();
                    if (response.succeeded && response.data) {
                        updateUser(response.data);
                    } else {
                        clearAuth();
                    }
                } catch (error) {
                    console.error("Session verification failed", error);
                    // The axios interceptor handles 401s and attempts to refresh
                    // If everything fails, it will redirect to login and clear auth.
                    // But if this is just a network error, we don't necessarily want to log them out immediately.
                }
            }
        };

        verifySession();
    }, [token, isAuthenticated, updateUser, clearAuth]);

    return <>{children}</>;
}
