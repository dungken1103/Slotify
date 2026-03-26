import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Film, Building2, Users, Ticket, Loader2 } from "lucide-react";
import { movieService } from "../../services/movie.service";
import { CinemaService } from "../../services/cinema.service";
import { UserService } from "../../services/user.service";
import { bookingService } from "../../services/bookingService";
import { movieRankingService } from "../../services/movieRanking.service";
import { formatCurrency } from "../../lib/utils";
import type { BookingResponse } from "../../types/booking";
import type { MovieResponse } from "../../types/movie";

export function AdminDashboard() {
    const [counts, setCounts] = useState({
        movies: 0,
        cinemas: 0,
        users: 0,
        ticketsSoldToday: 0,
        paidBookingsTodayCount: 0,
        revenueToday: 0,
        recentPaidBookings: [] as BookingResponse[],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [moviesList, setMoviesList] = useState<MovieResponse[]>([]);
    const [topMovieTitles, setTopMovieTitles] = useState<string[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [moviesRes, cinemasRes, usersRes, dashboardRes] = await Promise.all([
                    movieService.getAllMovies(false),
                    CinemaService.getAll(false),
                    UserService.getAll(),
                    bookingService.getAdminDashboard(6),
                ]);

                setMoviesList(moviesRes || []);

                setCounts({
                    movies: moviesRes?.length || 0,
                    cinemas: cinemasRes.succeeded ? (cinemasRes.data?.length ?? 0) : 0,
                    users: usersRes.succeeded ? (usersRes.data?.length ?? 0) : 0,
                    ticketsSoldToday: dashboardRes?.ticketsSoldToday ?? 0,
                    paidBookingsTodayCount: dashboardRes?.paidBookingsTodayCount ?? 0,
                    revenueToday: dashboardRes?.revenueToday ?? 0,
                    recentPaidBookings: dashboardRes?.recentPaidBookings ?? [],
                });
            } catch (error) {
                console.error("Lỗi khi tải thống kê:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        if (moviesList.length === 0) return;

        const run = async () => {
            const topIds = await movieRankingService.getTopBookedMovieIds(5);
            const titleById = new Map(moviesList.map((m) => [m.id, m.title]));
            const titles = topIds.map((id) => titleById.get(id) ?? id);
            setTopMovieTitles(titles);
        };

        run();
    }, [moviesList]);

    const stats = [
        { title: "Tổng Phim", value: counts.movies.toString(), icon: Film, trend: "Tất cả phim trong kho" },
        { title: "Cụm Rạp", value: counts.cinemas.toString(), icon: Building2, trend: "Đang hoạt động" },
        { title: "Người Dùng", value: counts.users.toString(), icon: Users, trend: "Thành viên đăng ký" },
        {
            title: "Vé Đã Bán",
            value: counts.ticketsSoldToday.toLocaleString("vi-VN"),
            icon: Ticket,
            trend: `${counts.paidBookingsTodayCount.toLocaleString("vi-VN")} đơn • ${formatCurrency(counts.revenueToday)}`,
        },
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
                    stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle>Lịch Sử Đặt Vé Gần Đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {counts.recentPaidBookings.length === 0 ? (
                            <div className="h-[220px] flex items-center justify-center text-muted-foreground border-dashed border-2 m-4 rounded-lg border-border bg-muted/30">
                                Chưa có đơn thanh toán hôm nay
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {counts.recentPaidBookings.map((b) => {
                                    const seatSummary = (b.tickets || [])
                                        .map((t) => `${t.seatRow}${t.seatNumber}`)
                                        .join(", ");
                                    const start = b.startTime ? new Date(b.startTime) : null;

                                    return (
                                        <div key={b.id} className="border rounded-lg p-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <div className="font-medium">{b.movieTitle}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {b.cinemaName} • {b.auditoriumName}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">{formatCurrency(b.totalAmount)}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {start && !Number.isNaN(start.getTime())
                                                            ? start.toLocaleString("vi-VN")
                                                            : ""}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-sm text-muted-foreground">
                                                Ghế: {seatSummary}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Phim Nổi Bật Dẫn Đầu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topMovieTitles.length === 0 ? (
                            <div className="h-[220px] flex items-center justify-center text-muted-foreground border-dashed border-2 m-4 rounded-lg border-border bg-muted/30">
                                Đang tải dữ liệu
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topMovieTitles.map((title, idx) => (
                                    <div key={`${title}-${idx}`} className="flex items-start justify-between gap-3 border rounded-lg p-3">
                                        <div className="text-sm text-muted-foreground">#{idx + 1}</div>
                                        <div className="font-medium">{title}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
