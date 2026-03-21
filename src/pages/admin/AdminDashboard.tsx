import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Film, Building2, Users, Ticket, Loader2 } from "lucide-react";
import { movieService } from "../../services/movie.service";
import { CinemaService } from "../../services/cinema.service";
import { UserService } from "../../services/user.service";

export function AdminDashboard() {
    const [counts, setCounts] = useState({ movies: 0, cinemas: 0, users: 0, tickets: 8549 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [moviesRes, cinemasRes, usersRes] = await Promise.all([
                    movieService.getAllMovies(false),
                    CinemaService.getAll(false),
                    UserService.getAll()
                ]);

                setCounts({
                    movies: moviesRes?.length || 0,
                    cinemas: cinemasRes.succeeded ? (cinemasRes.data?.length ?? 0) : 0,
                    users: usersRes.succeeded ? (usersRes.data?.length ?? 0) : 0,
                    tickets: 8549 // Still mocked for now until Bookings are implemented
                });
            } catch (error) {
                console.error("Lỗi khi tải thống kê:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { title: "Tổng Phim", value: counts.movies.toString(), icon: Film, trend: "Tất cả phim trong kho" },
        { title: "Cụm Rạp", value: counts.cinemas.toString(), icon: Building2, trend: "Đang hoạt động" },
        { title: "Người Dùng", value: counts.users.toString(), icon: Users, trend: "Thành viên đăng ký" },
        { title: "Vé Đã Bán", value: counts.tickets.toLocaleString('vi-VN'), icon: Ticket, trend: "Chưa hỗ trợ Live Data" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tổng Quan</h2>
                <p className="text-muted-foreground mt-1">
                    Chào mừng trở lại, Quản trị viên. Dưới đây là thống kê hoạt động hôm nay.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    <div className="col-span-4 flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stat.trend}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Placeholder for future charts or tables */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Lịch Sử Đặt Vé Gần Đây</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed border-2 m-4 rounded-lg border-border bg-muted/30">
                        Dữ liệu đặt vé sẽ hiển thị tại đây
                    </CardContent>
                </Card>
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Phim Nổi Bật Dẫn Đầu</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground border-dashed border-2 m-4 rounded-lg border-border bg-muted/30">
                        Số liệu thống kê sẽ hiển thị tại đây
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
