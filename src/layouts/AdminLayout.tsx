import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../middlewares/useAuthStore";
import {
    LayoutDashboard,
    Film,
    Building2,
    CalendarDays,
    Users,
    LogOut,
    Ticket
} from "lucide-react";
import { Button } from "../components/ui/button";

export function AdminLayout() {
    const { user, clearAuth } = useAuthStore();
    const location = useLocation();

    const handleLogout = () => {
        clearAuth();
    };

    const navItems = [
        { label: "Tổng Quan", path: "/admin", icon: LayoutDashboard },
        { label: "Kho Phim", path: "/admin/movies", icon: Film },
        { label: "Cụm Rạp & Ghế", path: "/admin/cinemas", icon: Building2 },
        { label: "Lịch Chiếu", path: "/admin/showtimes", icon: CalendarDays },
        { label: "Người Dùng", path: "/admin/users", icon: Users },
    ];
    const currentItem = [...navItems]
        .sort((a, b) => b.path.length - a.path.length)
        .find(item => location.pathname.startsWith(item.path));

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card">
                <div className="flex h-16 items-center border-b border-border px-6">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                        <Ticket className="h-6 w-6" />
                        <span>Slotify Admin</span>
                    </Link>
                </div>

                <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (location.pathname.startsWith(item.path) && item.path !== "/admin");
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-4 border-t border-border">
                        <div className="mb-4 px-3 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                {user?.fullName?.charAt(0) || "A"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{user?.fullName}</span>
                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Đăng Xuất
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-64">
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm shadow-sm transition-all duration-300">
                    {/* example: /admin/showtimes -> lịch chiếu */}
                    <h1 className="text-xl font-semibold capitalize tracking-tight">
                        {location.pathname === "/admin"
                            ? "Bảng Điều Khiển Nội Bộ"
                            : currentItem?.label}
                    </h1>
                    <div className="flex items-center gap-4">
                        {/* Add top bar actions here like notifications or global search if needed */}
                        <Button variant="outline" asChild size="sm" className="shadow-sm hover:shadow-md transition-all">
                            <Link to="/">Trang Khách Hàng</Link>
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
